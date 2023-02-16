"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeRoot = void 0;
const main_1 = require("../main");
const root_1 = require("./handlers/root");
function routeRoot() {
    main_1.server
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
        handler: root_1.registerHandler,
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
        handler: root_1.loginHandler,
    });
}
exports.routeRoot = routeRoot;
