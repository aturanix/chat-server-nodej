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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtGenerator = void 0;
const crypto_1 = require("crypto");
const jwt = __importStar(require("jsonwebtoken"));
class JwtGenerator {
    constructor() {
        this._secret = (0, crypto_1.randomBytes)(32);
    }
    create(id) {
        const timestamp = (Date.now() / 1000) | 0;
        return jwt.sign({ sub: id, iat: timestamp, exp: timestamp + 60 * 60 * 24 * 7 }, this._secret);
    }
    validate(token) {
        try {
            const payload = jwt.verify(token, this._secret);
            if (typeof payload !== "string" && typeof payload.sub !== "undefined") {
                return parseInt(payload.sub, 10);
            }
        }
        catch (_a) {
            return undefined;
        }
        return undefined;
    }
}
exports.JwtGenerator = JwtGenerator;
