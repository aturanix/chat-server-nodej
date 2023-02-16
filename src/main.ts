import { fastify } from "fastify";
import { routeRoot } from "./server/root";
import "reflect-metadata";
import { initializeDataSource } from "./data-source";
import { JwtGenerator } from "./helpers/jwt-generator";
import { routeRegisterUserWs } from "./server/user-ws";
import { Clients } from "./helpers/clients";
import { Groups } from "./helpers/groups";
import { DataSourceOptions } from "typeorm";

export const jwtGenerator = new JwtGenerator();

export let clients = new Clients();
export let groups = new Groups();

export const server = fastify({
  logger: true,
});

export async function main(options: DataSourceOptions) {
  await initializeDataSource(options);

  routeRoot();
  routeRegisterUserWs();

  await server.listen({ port: 3000 });
}
