"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.loginHandler = exports.registerHandler = void 0;
const argon2 = __importStar(require("@node-rs/argon2"));
const data_source_1 = require("../../data-source");
const User_1 = require("../../entity/User");
const main_1 = require("../../main");
const registerHandler = (request, _reply) => __awaiter(void 0, void 0, void 0, function* () {
    const body = request.body;
    const hash = yield argon2.hash(body.password, {
        algorithm: 2 /* argon2.Algorithm.Argon2id */,
    });
    const user = new User_1.User();
    user.name = body.name;
    user.hash = hash;
    yield data_source_1.AppDataSource.manager.save(user);
});
exports.registerHandler = registerHandler;
const loginHandler = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const body = request.body;
    const user = yield data_source_1.AppDataSource.manager.findOneBy(User_1.User, { name: body.name });
    if (user === null) {
        throw Error("user does not exist");
    }
    if (yield argon2.verify(user.hash, body.password)) {
        const token = main_1.jwtGenerator.create(user.id);
        reply.send({ token: token });
    }
    throw Error("login failed");
});
exports.loginHandler = loginHandler;
