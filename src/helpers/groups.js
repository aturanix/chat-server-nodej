"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Groups = void 0;
class Groups {
    constructor() {
        this.groups = new Map();
        this.ids = new Map();
    }
    add(id, name) {
        if (this.ids.has(name)) {
            return false;
        }
        this.groups.set(id, { name: name, clients: new Set() });
        this.ids.set(name, id);
        return true;
    }
    remove(id) {
        const name = this.getName(id);
        if (typeof name === "undefined") {
            return false;
        }
        this.groups.delete(id);
        this.ids.delete(name);
        return true;
    }
    has(id) {
        return this.groups.has(id);
    }
    hasClient(id, clientId) {
        var _a;
        const res = (_a = this.getClientsOfGroup(id)) === null || _a === void 0 ? void 0 : _a.has(clientId);
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
        return (_a = this.groups.get(id)) === null || _a === void 0 ? void 0 : _a.name;
    }
    getClientCountOfGroup(id) {
        var _a;
        return (_a = this.groups.get(id)) === null || _a === void 0 ? void 0 : _a.clients.size;
    }
    getClientsOfGroup(id) {
        var _a;
        return (_a = this.groups.get(id)) === null || _a === void 0 ? void 0 : _a.clients;
    }
    addClientToGroup(id, clientId) {
        var _a;
        return (_a = this.getClientsOfGroup(id)) === null || _a === void 0 ? void 0 : _a.add(clientId);
    }
    removeClientFromGroup(id, clientId) {
        var _a;
        const clients = (_a = this.groups.get(id)) === null || _a === void 0 ? void 0 : _a.clients;
        if (typeof clients === "undefined") {
            return false;
        }
        return clients.delete(clientId);
    }
}
exports.Groups = Groups;
