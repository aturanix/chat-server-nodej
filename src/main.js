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
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.server = exports.groups = exports.clients = exports.jwtGenerator = void 0;
const fastify_1 = require("fastify");
const root_1 = require("./server/root");
require("reflect-metadata");
const data_source_1 = require("./data-source");
const jwt_generator_1 = require("./helpers/jwt-generator");
const user_ws_1 = require("./server/user-ws");
const clients_1 = require("./helpers/clients");
const groups_1 = require("./helpers/groups");
exports.jwtGenerator = new jwt_generator_1.JwtGenerator();
exports.clients = new clients_1.Clients();
exports.groups = new groups_1.Groups();
exports.server = (0, fastify_1.fastify)({
    logger: true,
});
function main(options) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, data_source_1.initializeDataSource)(options);
        (0, root_1.routeRoot)();
        (0, user_ws_1.routeRegisterUserWs)();
        yield exports.server.listen({ port: 3000 });
    });
}
exports.main = main;
