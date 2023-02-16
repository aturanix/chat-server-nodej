export type ClientMessage =
  | Send
  | SendGroup
  | Token
  | CreateGroup
  | JoinGroup
  | DeleteGroup
  | LeaveGroup
  | ListUsers
  | ListGroups
  | MessageHistory
  | MessageHistoryGroup;

export interface Send {
  type: "send";
  toUserId: string;
  message: string;
}

export interface SendGroup {
  type: "send-group";
  toGroupId: string;
  message: string;
}

export interface Token {
  type: "token";
  token: string;
}

export interface CreateGroup {
  type: "create-group";
  name: string;
}

export interface JoinGroup {
  type: "join-group";
  groupId: string;
}

export interface DeleteGroup {
  type: "delete-group";
  groupId: string;
}

export interface LeaveGroup {
  type: "leave-group";
  groupId: string;
}

export interface ListUsers {
  type: "list-users";
}

export interface ListGroups {
  type: "list-groups";
}

export interface MessageHistory {
  type: "message-history";
  withUserId: string;
}

export interface MessageHistoryGroup {
  type: "message-history-group";
  fromGroupId: string;
}
