import { server } from "../main";
import { loginHandler, registerHandler } from "./handlers/root";

export function routeRoot() {
  server
    .route({
      method: "POST",
      url: "/register",
      schema: {
        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 6, maxLength: 63 },
            password: { type: "string", minLength: 8, maxLength: 255 },
          },
          required: ["name", "password"],
          additionalProperties: false,
        },
      },
      handler: registerHandler,
    })
    .route({
      method: "POST",
      url: "/login",
      schema: {
        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 6, maxLength: 63 },
            password: { type: "string", minLength: 1, maxLength: 255 },
          },
          required: ["name", "password"],
          additionalProperties: false,
        },
        response: {
          200: {
            type: "object",
            properties: {
              token: { type: "string" },
            },
            required: ["token"],
            additionalProperties: false,
          },
        },
      },
      handler: loginHandler,
    })
}
