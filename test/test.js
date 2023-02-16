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
const chai = __importStar(require("chai"));
const jwt_generator_1 = require("../src/helpers/jwt-generator");
describe("JwtHandler", () => {
    describe("validate()", () => {
        const jwtH1 = new jwt_generator_1.JwtGenerator();
        const jwtH2 = new jwt_generator_1.JwtGenerator();
        it("different handler", () => {
            const token = jwtH1.create(5);
            const token2 = jwtH2.create(5);
            chai.assert.throws(() => {
                jwtH2.validate(token);
            });
            chai.assert.throws(() => {
                jwtH1.validate(token2);
            });
        });
        it("same handler same id", () => {
            const token = jwtH1.create(5);
            chai.assert.equal(jwtH1.validate(token), 5);
            const token2 = jwtH2.create(7);
            chai.assert.equal(jwtH2.validate(token2), 7);
        });
    });
});
