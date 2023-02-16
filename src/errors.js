"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = void 0;
var error;
(function (error) {
    error.generic = {
        type: "error",
        kind: "generic",
        message: "something happened",
    };
    error.json = {
        type: "error",
        kind: "json",
        message: "malformed json input",
    };
    error.unsupported = {
        type: "error",
        kind: "unsupported",
        message: "unsupported operation",
    };
    error.userExists = {
        type: "error",
        kind: "user-exist",
        message: "user already exists",
    };
    error.userNotExist = {
        type: "error",
        kind: "user-not-exist",
        message: "user does not exist",
    };
    error.receiverUserNotExist = {
        type: "error",
        kind: "receiver-user-not-exist",
        message: "receiver user does not exist",
    };
    error.groupExist = {
        type: "error",
        kind: "group-exist",
        message: "group already exists",
    };
    error.groupNotExist = {
        type: "error",
        kind: "group-not-exist",
        message: "group does not exist",
    };
    error.receiverGroupNotExist = {
        type: "error",
        kind: "receiver-group-not-exist",
        message: "receiver group does not exist",
    };
    error.tokenValidation = {
        type: "error",
        kind: "token-validation",
        message: "token validation failed",
    };
    error.alreadyValidated = {
        type: "error",
        kind: "already-validated",
        message: "token validation was already done",
    };
    error.authorization = {
        type: "error",
        kind: "authorization",
        message: "user is unauthorized",
    };
    error.inGroup = {
        type: "error",
        kind: "in-group",
        message: "user is already in group",
    };
    error.notInGroup = {
        type: "error",
        kind: "not-in-group",
        message: "user is not in group",
    };
    error.notOwner = {
        type: "error",
        kind: "not-owner",
        message: "user is not the owner of the group",
    };
    error.alreadyLogged = {
        type: "error",
        kind: "already-logged",
        message: "user is already logged in",
    };
})(error = exports.error || (exports.error = {}));
