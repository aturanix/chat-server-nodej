"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeRegisterUserWs = void 0;
const main_1 = require("../main");
const websocket_1 = __importDefault(require("@fastify/websocket"));
const user_ws_1 = require("./handlers/user-ws");
function routeRegisterUserWs() {
    main_1.server.register(websocket_1.default, { options: { maxPayload: 1048576 } });
    main_1.server.register(function (fastify) {
        return __awaiter(this, void 0, void 0, function* () {
            fastify.get("/ws", { websocket: true }, user_ws_1.wsHandler);
        });
    });
}
exports.routeRegisterUserWs = routeRegisterUserWs;
