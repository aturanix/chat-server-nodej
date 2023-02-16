interface Group {
  readonly name: string;
  clients: Set<number>;
}

export class Groups {
  groups: Map<number, Group>;
  ids: Map<string, number>;

  public constructor() {
    this.groups = new Map();
    this.ids = new Map();
  }

  public add(id: number, name: string): boolean {
    if (this.ids.has(name)) {
        return false;
    }

    this.groups.set(id, { name: name, clients: new Set() });
    this.ids.set(name, id);

    return true;
  }

  public remove(id: number): boolean {
    const name = this.getName(id);
    if (typeof name === "undefined") {
      return false;
    }

    this.groups.delete(id);
    this.ids.delete(name);

    return true;
  }

  public has(id: number): boolean {
    return this.groups.has(id);
  }

  public hasClient(id: number, clientId: number): boolean {
    const res = this.getClientsOfGroup(id)?.has(clientId);
    if (typeof res === "undefined") {
      return false;
    }

    return res;
  }

  public getId(name: string): number | undefined {
    return this.ids.get(name);
  }

  public getName(id: number): string | undefined {
    return this.groups.get(id)?.name;
  }

  public getClientCountOfGroup(id: number): number | undefined {
    return this.groups.get(id)?.clients.size;
  }

  public getClientsOfGroup(id: number): Set<number> | undefined {
    return this.groups.get(id)?.clients;
  }

  public addClientToGroup(id: number, clientId: number): Set<number> | undefined {
    return this.getClientsOfGroup(id)?.add(clientId);
  }

  public removeClientFromGroup(id: number, clientId: number): boolean {
    const clients = this.groups.get(id)?.clients;
    if (typeof clients === "undefined") {
      return false;
    }

    return clients.delete(clientId);
  }
}
