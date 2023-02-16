import { WebSocket } from "ws";

interface Client {
  readonly name: string;
  groups: Set<number>;
  readonly socket: WebSocket;
}

export class Clients {
  clients: Map<number, Client>;
  ids: Map<string, number>;

  public constructor() {
    this.clients = new Map();
    this.ids = new Map();
  }

  public add(id: number, name: string, socket: WebSocket): boolean {
    if (this.ids.has(name)) {
      return false;
    }

    this.clients.set(id, { name: name, groups: new Set(), socket: socket });
    this.ids.set(name, id);

    return true;
  }

  public remove(id: number): boolean {
    const name = this.getName(id);
    if (typeof name === "undefined") {
      return false;
    }

    this.clients.delete(id);
    this.ids.delete(name);

    return true;
  }

  public has(id: number): boolean {
    return this.clients.has(id);
  }

  public hasGroup(id: number, groupId: number): boolean {
    const res = this.getGroups(id)?.has(groupId);
    if (typeof res === "undefined") {
      return false;
    }

    return res;
  }

  public getId(name: string): number | undefined {
    return this.ids.get(name);
  }

  public getName(id: number): string | undefined {
    return this.clients.get(id)?.name;
  }

  public getGroupCountOfClient(id: number): number | undefined {
    return this.clients.get(id)?.groups.size;
  }

  public getGroups(id: number): Set<number> | undefined {
    return this.clients.get(id)?.groups;
  }

  public getSocket(id: number): WebSocket | undefined {
    return this.clients.get(id)?.socket;
  }

  public addGroupToClient(id: number, groupId: number): Set<number> | undefined {
    return this.getGroups(id)?.add(groupId);
  }

  public removeGroup(id: number, groupId: number): boolean {
    const clientGroups = this.clients.get(id)?.groups;
    if (typeof clientGroups === "undefined") {
      return false;
    }

    return clientGroups.delete(groupId);
  }
}
