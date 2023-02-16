export type ServerMessage =
  | Error
  | Receive
  | ReceiveGroup
  | Ok
  | ListUsers
  | ListGroups
  | MessageHistory
  | MessageHistoryGroup;

export interface Error {
  type: "error";
  kind:
    | "generic"
    | "json"
    | "user-exist"
    | "user-not-exist"
    | "receiver-user-not-exist"
    | "group-exist"
    | "group-not-exist"
    | "receiver-group-not-exist"
    | "token-validation"
    | "already-validated"
    | "in-group"
    | "not-in-group"
    | "not-owner"
    | "authorization"
    | "unsupported"
    | "already-logged";
  message: string;
}

export interface Receive {
  type: "receive";
  fromUserId: string;
  message: string;
}

export interface ReceiveGroup {
  type: "receive-group";
  fromUserId: string;
  fromGroupId: string;
  message: string;
}

export interface Ok {
  type: "ok";
}

export interface ListUsers {
  type: "list-users";
  users: { id: string; name: string }[];
}

export interface ListGroups {
  type: "list-groups";
  groups: { id: string; ownerId: string; name: string }[];
}

export interface MessageHistory {
  type: "message-history";
  messages: { fromId: string; toId: string; message: string }[];
}

export interface MessageHistoryGroup {
  type: "message-history-group";
  messages: { fromId: string; message: string }[];
}
