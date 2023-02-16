import { WebsocketHandler } from "@fastify/websocket";
import { clients, groups, jwtGenerator } from "../../main";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import * as mtc from "../message-types/client";
import * as mts from "../message-types/server";
import { error as errors } from "../../errors";
import { Group } from "../../entity/Group";
import { WebSocket } from "ws";
import { Message } from "../../entity/Message";
import { GroupMessage } from "../../entity/GroupMessage";

export const wsHandler: WebsocketHandler = (connection, _request) => {
  let id: number | undefined = undefined;

  connection.socket.on("message", async (data) => {
    let msg: mtc.ClientMessage;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      connection.socket.send(JSON.stringify(errors.json));
      connection.socket.terminate();
      return;
    }

    if (typeof id === "undefined") {
      if (msg.type !== "token") {
        connection.socket.send(JSON.stringify(errors.authorization));
        connection.socket.terminate();
        return;
      }

      id = await tokenOp(connection.socket, msg);
      return;
    } else if (msg.type === "token") {
      connection.socket.send(JSON.stringify(errors.alreadyValidated));
      return;
    }

    switch (msg.type) {
      case "send":
        sendOp(connection.socket, id, msg);
        return;
      case "send-group":
        sendGroupOp(connection.socket, id, msg);
        return;
      case "create-group":
        createGroupOp(connection.socket, id, msg);
        return;
      case "join-group":
        joinGroupOp(connection.socket, id, msg);
        return;
      case "delete-group":
        deleteGroupOp(connection.socket, id, msg);
        return;
      case "leave-group":
        leaveGroupOp(connection.socket, id, msg);
        return;
      case "list-users":
        listUsersOp(connection.socket);
        return;
      case "list-groups":
        listGroupsOp(connection.socket);
        return;
      case "message-history":
        messageHistoryOp(connection.socket, id, msg);
        return;
      case "message-history-group":
        messageHistorGroupOp(connection.socket, id, msg);
        return;
    }
  });

  connection.socket.on("close", () => {
    if (typeof id === "undefined") {
      return;
    }

    const clientGroups = clients.getGroups(id)!;
    for (const groupId of clientGroups) {
      if (groups.getClientCountOfGroup(groupId) == 1) {
        groups.remove(groupId);
      } else {
        groups.removeClientFromGroup(groupId, id);
      }
    }

    clients.remove(id);
  });
};

async function tokenOp(
  socket: WebSocket,
  msg: mtc.Token
): Promise<number | undefined> {
  const id = jwtGenerator.validate(msg.token);
  if (typeof id === "undefined") {
    socket.send(JSON.stringify(errors.tokenValidation));
    socket.terminate();
    return undefined;
  } else if (clients.has(id)) {
    socket.send(JSON.stringify(errors.alreadyLogged));
    socket.terminate();
    return undefined;
  }

  const user = await AppDataSource.manager.findOne(User, {
    where: { id: id },
    relations: { groups: true },
  });
  if (user === null) {
    socket.send(JSON.stringify(errors.userNotExist));
    socket.terminate();
    return undefined;
  }

  clients.add(id, user.name, socket);
  for (const group of user.groups) {
    if (!groups.has(group.id)) {
      groups.add(group.id, group.name);
    }

    clients.addGroupToClient(id, group.id);
    groups.addClientToGroup(group.id, id);
  }

  const okMsg: mts.Ok = { type: "ok" };
  socket.send(JSON.stringify(okMsg));
  return id;
}

async function sendOp(
  socket: WebSocket,
  userId: number,
  msg: mtc.Send
): Promise<void> {
  const toId = parseInt(msg.toUserId, 10);
  if (isNaN(toId)) {
    socket.send(JSON.stringify(errors.json));
    socket.terminate();
    return;
  }

  const toSocket = clients.getSocket(toId);
  if (typeof toSocket === "undefined") {
    socket.send(JSON.stringify(errors.receiverUserNotExist));
    return;
  }

  const message = new Message();
  message.from_id = userId;
  message.to_id = toId;
  message.message = msg.message;
  AppDataSource.manager.save(message);

  const toMsg: mts.Receive = {
    type: "receive",
    fromUserId: userId.toString(),
    message: msg.message,
  };
  toSocket.send(JSON.stringify(toMsg));
}

async function sendGroupOp(
  socket: WebSocket,
  userId: number,
  msg: mtc.SendGroup
): Promise<void> {
  const groupId = parseInt(msg.toGroupId, 10);
  if (isNaN(groupId)) {
    socket.send(JSON.stringify(errors.json));
    socket.terminate();
    return;
  }

  const groupClients = groups.getClientsOfGroup(groupId);
  if (typeof groupClients === "undefined") {
    socket.send(JSON.stringify(errors.receiverGroupNotExist));
    return;
  }

  if (!groupClients.has(userId)) {
    socket.send(JSON.stringify(errors.notInGroup));
    return;
  }

  const message = new GroupMessage();
  message.from_user_id = userId;
  message.to_group_id = groupId;
  message.message = msg.message;
  AppDataSource.manager.save(message);

  for (const toId of groupClients) {
    const toSocket = clients.getSocket(toId)!;
    const toMsg: mts.ReceiveGroup = {
      type: "receive-group",
      fromUserId: userId.toString(),
      fromGroupId: msg.toGroupId,
      message: msg.message,
    };
    toSocket.send(JSON.stringify(toMsg));
  }
  return;
}

async function createGroupOp(
  socket: WebSocket,
  userId: number,
  msg: mtc.CreateGroup
): Promise<void> {
  if (
    await AppDataSource.manager.exists(Group, {
      where: { name: msg.name },
    })
  ) {
    socket.send(JSON.stringify(errors.groupExist));
    return;
  }

  const user = await AppDataSource.manager.findOne(User, {
    where: { id: userId },
    relations: { groups: true },
  });
  if (user === null) {
    socket.send(JSON.stringify(errors.userNotExist));
    return;
  }

  const group = new Group();
  group.owner_id = userId;
  group.name = msg.name;
  group.users = [user];
  await AppDataSource.manager.save(group);

  user.groups.push(group);
  await AppDataSource.manager.save(user);

  groups.add(group.id, group.name);
  groups.addClientToGroup(group.id, userId);
  clients.addGroupToClient(userId, group.id);
}

async function joinGroupOp(
  socket: WebSocket,
  userId: number,
  msg: mtc.JoinGroup
) {
  const groupId = parseInt(msg.groupId);
  if (isNaN(groupId)) {
    socket.send(JSON.stringify(errors.json));
    socket.terminate();
  }

  const group = await AppDataSource.manager.findOne(Group, {
    where: {
      id: groupId,
    },
    relations: { users: true },
  });
  if (group === null) {
    socket.send(JSON.stringify(errors.groupNotExist));
    return;
  }

  const user = await AppDataSource.manager.findOne(User, {
    where: { id: userId },
    relations: { groups: true },
  });
  if (user === null) {
    socket.send(JSON.stringify(errors.userNotExist));
    return;
  }

  if (groups.hasClient(groupId, userId)) {
    socket.send(JSON.stringify(errors.inGroup));
    return;
  }

  group.users.push(user);
  await AppDataSource.manager.save(group);

  user.groups.push(group);
  await AppDataSource.manager.save(user);

  if (typeof groups.getName(groupId) === "undefined") {
    groups.add(group.id, group.name);
  }

  groups.addClientToGroup(groupId, userId);
  clients.addGroupToClient(userId, groupId);
}

async function deleteGroupOp(
  socket: WebSocket,
  userId: number,
  msg: mtc.DeleteGroup
) {
  const groupId = parseInt(msg.groupId, 10);
  if (isNaN(groupId)) {
    socket.send(JSON.stringify(errors.json));
    socket.terminate();
    return;
  }

  if (!groups.hasClient(groupId, userId)) {
    socket.send(JSON.stringify(errors.notInGroup));
    return;
  }

  const group = await AppDataSource.manager.findOne(Group, {
    where: { id: groupId },
    relations: { users: { groups: true } },
  });
  if (group === null) {
    socket.send(JSON.stringify(errors.groupNotExist));
    return;
  } else if (group.owner_id !== userId) {
    socket.send(JSON.stringify(errors.notOwner));
    return;
  }

  for (const user of group.users) {
    clients.removeGroup(user.id, group.id);
    user.groups = user.groups.filter((v) => v.id !== group.id);
    await AppDataSource.manager.save(user);
  }

  groups.remove(group.id);
  await AppDataSource.manager.remove(group);
}

async function leaveGroupOp(
  socket: WebSocket,
  userId: number,
  msg: mtc.LeaveGroup
) {
  const groupId = parseInt(msg.groupId, 10);
  if (isNaN(groupId)) {
    socket.send(JSON.stringify(errors.json));
    socket.terminate();
    return;
  }

  if (
    groups.removeClientFromGroup(groupId, userId) &&
    clients.removeGroup(userId, groupId)
  ) {
    const user = await AppDataSource.manager.findOne(User, {
      where: { id: userId },
      relations: { groups: true },
    });

    if (user === null) {
      socket.send(JSON.stringify(errors.userNotExist));
      socket.terminate();
      return;
    }

    const group = await AppDataSource.manager.findOne(Group, {
      where: { id: groupId },
      relations: { users: true },
    });

    if (group === null) {
      socket.send(JSON.stringify(errors.groupNotExist));
      return;
    }

    user.groups = user.groups.filter((v) => v.id !== groupId);
    await AppDataSource.manager.save(User, user);

    if (group.users.length === 1) {
      await AppDataSource.manager.remove(Group, group);
    } else {
      group.users = group.users.filter((v) => v.id !== userId);
      group.owner_id = group.users[0].id;
      await AppDataSource.manager.save(Group, group);
    }
  } else {
    socket.send(JSON.stringify(errors.notInGroup));
  }
}

async function listUsersOp(socket: WebSocket) {
  const users = await AppDataSource.manager.find(User, {
    select: { id: true, name: true },
  });

  const listMsg: mts.ListUsers = {
    type: "list-users",
    users: users.map((user) => {
      return { id: user.id.toString(), name: user.name };
    }),
  };

  socket.send(JSON.stringify(listMsg));
}

async function listGroupsOp(socket: WebSocket) {
  const groups = await AppDataSource.manager.find(Group);

  const listMsg: mts.ListGroups = {
    type: "list-groups",
    groups: groups.map((v) => {
      return {
        id: v.id.toString(),
        ownerId: v.owner_id.toString(),
        name: v.name,
      };
    }),
  };
  socket.send(JSON.stringify(listMsg));
}

async function messageHistoryOp(
  socket: WebSocket,
  userId: number,
  msg: mtc.MessageHistory
) {
  const ofUserId = parseInt(msg.withUserId);
  if (isNaN(ofUserId)) {
    socket.send(JSON.stringify(errors.json));
    socket.terminate();
    return;
  }

  if (
    !(await AppDataSource.manager.exists(User, { where: { id: ofUserId } }))
  ) {
    socket.send(JSON.stringify(errors.userNotExist));
    return;
  }

  const messages = await AppDataSource.manager.find(Message, {
    select: { from_id: true, to_id: true, message: true },
    where: [
      { from_id: userId, to_id: ofUserId },
      { from_id: ofUserId, to_id: userId },
    ],
  });

  const historyMsg: mts.MessageHistory = {
    type: "message-history",
    messages: messages.map((v) => ({
      fromId: v.from_id.toString(),
      toId: v.to_id.toString(),
      message: v.message,
    })),
  };

  socket.send(JSON.stringify(historyMsg));
  return;
}

async function messageHistorGroupOp(
  socket: WebSocket,
  userId: number,
  msg: mtc.MessageHistoryGroup
) {
  const fromGroupId = parseInt(msg.fromGroupId);
  if (isNaN(fromGroupId)) {
    socket.send(JSON.stringify(errors.json));
    socket.terminate();
    return;
  }

  if (!groups.hasClient(fromGroupId, userId)) {
    socket.send(JSON.stringify(errors.notInGroup));
    return;
  }

  if (
    !(await AppDataSource.manager.exists(Group, { where: { id: fromGroupId } }))
  ) {
    socket.send(JSON.stringify(errors.groupNotExist));
    return;
  }

  const messages = await AppDataSource.manager.find(GroupMessage, {
    select: { from_user_id: true, message: true },
    where: { to_group_id: fromGroupId },
  });

  const historyMsg: mts.MessageHistoryGroup = {
    type: "message-history-group",
    messages: messages.map((v) => ({
      fromId: v.from_user_id.toString(),
      message: v.message,
    })),
  };

  socket.send(JSON.stringify(historyMsg));
  return;
}
