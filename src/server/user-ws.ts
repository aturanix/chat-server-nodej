import { server } from "../main";
import websocket from "@fastify/websocket";
import { wsHandler } from "./handlers/user-ws";

export function routeRegisterUserWs() {
  server.register(websocket, { options: { maxPayload: 1048576 } });
  server.register(async function (fastify) {
    fastify.get("/ws", { websocket: true }, wsHandler);
  });
}
