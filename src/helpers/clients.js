"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clients = void 0;
class Clients {
    constructor() {
        this.clients = new Map();
        this.ids = new Map();
    }
    add(id, name, socket) {
        if (this.ids.has(name)) {
            return false;
        }
        this.clients.set(id, { name: name, groups: new Set(), socket: socket });
        this.ids.set(name, id);
        return true;
    }
    remove(id) {
        const name = this.getName(id);
        if (typeof name === "undefined") {
            return false;
        }
        this.clients.delete(id);
        this.ids.delete(name);
        return true;
    }
    has(id) {
        return this.clients.has(id);
    }
    hasGroup(id, groupId) {
        var _a;
        const res = (_a = this.getGroups(id)) === null || _a === void 0 ? void 0 : _a.has(groupId);
        if (typeof res === "undefined") {
            return false;
        }
        return res;
    }
    getId(name) {
        return this.ids.get(name);
    }
    getName(id) {
        var _a;
        return (_a = this.clients.get(id)) === null || _a === void 0 ? void 0 : _a.name;
    }
    getGroupCountOfClient(id) {
        var _a;
        return (_a = this.clients.get(id)) === null || _a === void 0 ? void 0 : _a.groups.size;
    }
    getGroups(id) {
        var _a;
        return (_a = this.clients.get(id)) === null || _a === void 0 ? void 0 : _a.groups;
    }
    getSocket(id) {
        var _a;
        return (_a = this.clients.get(id)) === null || _a === void 0 ? void 0 : _a.socket;
    }
    addGroupToClient(id, groupId) {
        var _a;
        return (_a = this.getGroups(id)) === null || _a === void 0 ? void 0 : _a.add(groupId);
    }
    removeGroup(id, groupId) {
        var _a;
        const clientGroups = (_a = this.clients.get(id)) === null || _a === void 0 ? void 0 : _a.groups;
        if (typeof clientGroups === "undefined") {
            return false;
        }
        return clientGroups.delete(groupId);
    }
}
exports.Clients = Clients;
