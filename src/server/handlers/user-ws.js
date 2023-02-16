"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsHandler = void 0;
const main_1 = require("../../main");
const data_source_1 = require("../../data-source");
const User_1 = require("../../entity/User");
const errors_1 = require("../../errors");
const Group_1 = require("../../entity/Group");
const Message_1 = require("../../entity/Message");
const GroupMessage_1 = require("../../entity/GroupMessage");
const wsHandler = (connection, _request) => {
    let id = undefined;
    connection.socket.on("message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let msg;
        try {
            msg = JSON.parse(data.toString());
        }
        catch (_a) {
            connection.socket.send(JSON.stringify(errors_1.error.json));
            connection.socket.terminate();
            return;
        }
        if (typeof id === "undefined") {
            if (msg.type !== "token") {
                connection.socket.send(JSON.stringify(errors_1.error.authorization));
                connection.socket.terminate();
                return;
            }
            id = yield tokenOp(connection.socket, msg);
            return;
        }
        else if (msg.type === "token") {
            connection.socket.send(JSON.stringify(errors_1.error.alreadyValidated));
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
    }));
    connection.socket.on("close", () => {
        if (typeof id === "undefined") {
            return;
        }
        const clientGroups = main_1.clients.getGroups(id);
        for (const groupId of clientGroups) {
            if (main_1.groups.getClientCountOfGroup(groupId) == 1) {
                main_1.groups.remove(groupId);
            }
            else {
                main_1.groups.removeClientFromGroup(groupId, id);
            }
        }
        main_1.clients.remove(id);
    });
};
exports.wsHandler = wsHandler;
function tokenOp(socket, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = main_1.jwtGenerator.validate(msg.token);
        if (typeof id === "undefined") {
            socket.send(JSON.stringify(errors_1.error.tokenValidation));
            socket.terminate();
            return undefined;
        }
        else if (main_1.clients.has(id)) {
            socket.send(JSON.stringify(errors_1.error.alreadyLogged));
            socket.terminate();
            return undefined;
        }
        const user = yield data_source_1.AppDataSource.manager.findOne(User_1.User, {
            where: { id: id },
            relations: { groups: true },
        });
        if (user === null) {
            socket.send(JSON.stringify(errors_1.error.userNotExist));
            socket.terminate();
            return undefined;
        }
        main_1.clients.add(id, user.name, socket);
        for (const group of user.groups) {
            if (!main_1.groups.has(group.id)) {
                main_1.groups.add(group.id, group.name);
            }
            main_1.clients.addGroupToClient(id, group.id);
            main_1.groups.addClientToGroup(group.id, id);
        }
        const okMsg = { type: "ok" };
        socket.send(JSON.stringify(okMsg));
        return id;
    });
}
function sendOp(socket, userId, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        const toId = parseInt(msg.toUserId, 10);
        if (isNaN(toId)) {
            socket.send(JSON.stringify(errors_1.error.json));
            socket.terminate();
            return;
        }
        const toSocket = main_1.clients.getSocket(toId);
        if (typeof toSocket === "undefined") {
            socket.send(JSON.stringify(errors_1.error.receiverUserNotExist));
            return;
        }
        const message = new Message_1.Message();
        message.from_id = userId;
        message.to_id = toId;
        message.message = msg.message;
        data_source_1.AppDataSource.manager.save(message);
        const toMsg = {
            type: "receive",
            fromUserId: userId.toString(),
            message: msg.message,
        };
        toSocket.send(JSON.stringify(toMsg));
    });
}
function sendGroupOp(socket, userId, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        const groupId = parseInt(msg.toGroupId, 10);
        if (isNaN(groupId)) {
            socket.send(JSON.stringify(errors_1.error.json));
            socket.terminate();
            return;
        }
        const groupClients = main_1.groups.getClientsOfGroup(groupId);
        if (typeof groupClients === "undefined") {
            socket.send(JSON.stringify(errors_1.error.receiverGroupNotExist));
            return;
        }
        if (!groupClients.has(userId)) {
            socket.send(JSON.stringify(errors_1.error.notInGroup));
            return;
        }
        const message = new GroupMessage_1.GroupMessage();
        message.from_user_id = userId;
        message.to_group_id = groupId;
        message.message = msg.message;
        data_source_1.AppDataSource.manager.save(message);
        for (const toId of groupClients) {
            const toSocket = main_1.clients.getSocket(toId);
            const toMsg = {
                type: "receive-group",
                fromUserId: userId.toString(),
                fromGroupId: msg.toGroupId,
                message: msg.message,
            };
            toSocket.send(JSON.stringify(toMsg));
        }
        return;
    });
}
function createGroupOp(socket, userId, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield data_source_1.AppDataSource.manager.exists(Group_1.Group, {
            where: { name: msg.name },
        })) {
            socket.send(JSON.stringify(errors_1.error.groupExist));
            return;
        }
        const user = yield data_source_1.AppDataSource.manager.findOne(User_1.User, {
            where: { id: userId },
            relations: { groups: true },
        });
        if (user === null) {
            socket.send(JSON.stringify(errors_1.error.userNotExist));
            return;
        }
        const group = new Group_1.Group();
        group.owner_id = userId;
        group.name = msg.name;
        group.users = [user];
        yield data_source_1.AppDataSource.manager.save(group);
        user.groups.push(group);
        yield data_source_1.AppDataSource.manager.save(user);
        main_1.groups.add(group.id, group.name);
        main_1.groups.addClientToGroup(group.id, userId);
        main_1.clients.addGroupToClient(userId, group.id);
    });
}
function joinGroupOp(socket, userId, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        const groupId = parseInt(msg.groupId);
        if (isNaN(groupId)) {
            socket.send(JSON.stringify(errors_1.error.json));
            socket.terminate();
        }
        const group = yield data_source_1.AppDataSource.manager.findOne(Group_1.Group, {
            where: {
                id: groupId,
            },
            relations: { users: true },
        });
        if (group === null) {
            socket.send(JSON.stringify(errors_1.error.groupNotExist));
            return;
        }
        const user = yield data_source_1.AppDataSource.manager.findOne(User_1.User, {
            where: { id: userId },
            relations: { groups: true },
        });
        if (user === null) {
            socket.send(JSON.stringify(errors_1.error.userNotExist));
            return;
        }
        if (main_1.groups.hasClient(groupId, userId)) {
            socket.send(JSON.stringify(errors_1.error.inGroup));
            return;
        }
        group.users.push(user);
        yield data_source_1.AppDataSource.manager.save(group);
        user.groups.push(group);
        yield data_source_1.AppDataSource.manager.save(user);
        if (typeof main_1.groups.getName(groupId) === "undefined") {
            main_1.groups.add(group.id, group.name);
        }
        main_1.groups.addClientToGroup(groupId, userId);
        main_1.clients.addGroupToClient(userId, groupId);
    });
}
function deleteGroupOp(socket, userId, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        const groupId = parseInt(msg.groupId, 10);
        if (isNaN(groupId)) {
            socket.send(JSON.stringify(errors_1.error.json));
            socket.terminate();
            return;
        }
        if (!main_1.groups.hasClient(groupId, userId)) {
            socket.send(JSON.stringify(errors_1.error.notInGroup));
            return;
        }
        const group = yield data_source_1.AppDataSource.manager.findOne(Group_1.Group, {
            where: { id: groupId },
            relations: { users: { groups: true } },
        });
        if (group === null) {
            socket.send(JSON.stringify(errors_1.error.groupNotExist));
            return;
        }
        else if (group.owner_id !== userId) {
            socket.send(JSON.stringify(errors_1.error.notOwner));
            return;
        }
        for (const user of group.users) {
            main_1.clients.removeGroup(user.id, group.id);
            user.groups = user.groups.filter((v) => v.id !== group.id);
            yield data_source_1.AppDataSource.manager.save(user);
        }
        main_1.groups.remove(group.id);
        yield data_source_1.AppDataSource.manager.remove(group);
    });
}
function leaveGroupOp(socket, userId, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        const groupId = parseInt(msg.groupId, 10);
        if (isNaN(groupId)) {
            socket.send(JSON.stringify(errors_1.error.json));
            socket.terminate();
            return;
        }
        if (main_1.groups.removeClientFromGroup(groupId, userId) &&
            main_1.clients.removeGroup(userId, groupId)) {
            const user = yield data_source_1.AppDataSource.manager.findOne(User_1.User, {
                where: { id: userId },
                relations: { groups: true },
            });
            if (user === null) {
                socket.send(JSON.stringify(errors_1.error.userNotExist));
                socket.terminate();
                return;
            }
            const group = yield data_source_1.AppDataSource.manager.findOne(Group_1.Group, {
                where: { id: groupId },
                relations: { users: true },
            });
            if (group === null) {
                socket.send(JSON.stringify(errors_1.error.groupNotExist));
                return;
            }
            user.groups = user.groups.filter((v) => v.id !== groupId);
            yield data_source_1.AppDataSource.manager.save(User_1.User, user);
            if (group.users.length === 1) {
                yield data_source_1.AppDataSource.manager.remove(Group_1.Group, group);
            }
            else {
                group.users = group.users.filter((v) => v.id !== userId);
                group.owner_id = group.users[0].id;
                yield data_source_1.AppDataSource.manager.save(Group_1.Group, group);
            }
        }
        else {
            socket.send(JSON.stringify(errors_1.error.notInGroup));
        }
    });
}
function listUsersOp(socket) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield data_source_1.AppDataSource.manager.find(User_1.User, {
            select: { id: true, name: true },
        });
        const listMsg = {
            type: "list-users",
            users: users.map((user) => {
                return { id: user.id.toString(), name: user.name };
            }),
        };
        socket.send(JSON.stringify(listMsg));
    });
}
function listGroupsOp(socket) {
    return __awaiter(this, void 0, void 0, function* () {
        const groups = yield data_source_1.AppDataSource.manager.find(Group_1.Group);
        const listMsg = {
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
    });
}
function messageHistoryOp(socket, userId, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        const ofUserId = parseInt(msg.withUserId);
        if (isNaN(ofUserId)) {
            socket.send(JSON.stringify(errors_1.error.json));
            socket.terminate();
            return;
        }
        if (!(yield data_source_1.AppDataSource.manager.exists(User_1.User, { where: { id: ofUserId } }))) {
            socket.send(JSON.stringify(errors_1.error.userNotExist));
            return;
        }
        const messages = yield data_source_1.AppDataSource.manager.find(Message_1.Message, {
            select: { from_id: true, to_id: true, message: true },
            where: [
                { from_id: userId, to_id: ofUserId },
                { from_id: ofUserId, to_id: userId },
            ],
        });
        const historyMsg = {
            type: "message-history",
            messages: messages.map((v) => ({
                fromId: v.from_id.toString(),
                toId: v.to_id.toString(),
                message: v.message,
            })),
        };
        socket.send(JSON.stringify(historyMsg));
        return;
    });
}
function messageHistorGroupOp(socket, userId, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        const fromGroupId = parseInt(msg.fromGroupId);
        if (isNaN(fromGroupId)) {
            socket.send(JSON.stringify(errors_1.error.json));
            socket.terminate();
            return;
        }
        if (!main_1.groups.hasClient(fromGroupId, userId)) {
            socket.send(JSON.stringify(errors_1.error.notInGroup));
            return;
        }
        if (!(yield data_source_1.AppDataSource.manager.exists(Group_1.Group, { where: { id: fromGroupId } }))) {
            socket.send(JSON.stringify(errors_1.error.groupNotExist));
            return;
        }
        const messages = yield data_source_1.AppDataSource.manager.find(GroupMessage_1.GroupMessage, {
            select: { from_user_id: true, message: true },
            where: { to_group_id: fromGroupId },
        });
        const historyMsg = {
            type: "message-history-group",
            messages: messages.map((v) => ({
                fromId: v.from_user_id.toString(),
                message: v.message,
            })),
        };
        socket.send(JSON.stringify(historyMsg));
        return;
    });
}
