import * as mts from "./server/message-types/server";

export module error {
  export const generic: mts.Error = {
    type: "error",
    kind: "generic",
    message: "something happened",
  };

  export const json: mts.Error = {
    type: "error",
    kind: "json",
    message: "malformed json input",
  };

  export const unsupported: mts.Error = {
    type: "error",
    kind: "unsupported",
    message: "unsupported operation",
  };

  export const userExists: mts.Error = {
    type: "error",
    kind: "user-exist",
    message: "user already exists",
  };

  export const userNotExist: mts.Error = {
    type: "error",
    kind: "user-not-exist",
    message: "user does not exist",
  };

  export const receiverUserNotExist: mts.Error = {
    type: "error",
    kind: "receiver-user-not-exist",
    message: "receiver user does not exist",
  };

  export const groupExist: mts.Error = {
    type: "error",
    kind: "group-exist",
    message: "group already exists",
  };

  export const groupNotExist: mts.Error = {
    type: "error",
    kind: "group-not-exist",
    message: "group does not exist",
  };

  export const receiverGroupNotExist: mts.Error = {
    type: "error",
    kind: "receiver-group-not-exist",
    message: "receiver group does not exist",
  };

  export const tokenValidation: mts.Error = {
    type: "error",
    kind: "token-validation",
    message: "token validation failed",
  };

  export const alreadyValidated: mts.Error = {
    type: "error",
    kind: "already-validated",
    message: "token validation was already done",
  };

  export const authorization: mts.Error = {
    type: "error",
    kind: "authorization",
    message: "user is unauthorized",
  };

  export const inGroup: mts.Error = {
    type: "error",
    kind: "in-group",
    message: "user is already in group",
  };

  export const notInGroup: mts.Error = {
    type: "error",
    kind: "not-in-group",
    message: "user is not in group",
  };

  export const notOwner: mts.Error = {
    type: "error",
    kind: "not-owner",
    message: "user is not the owner of the group",
  };

  export const alreadyLogged: mts.Error = {
    type: "error",
    kind: "already-logged",
    message: "user is already logged in",
  };
}
