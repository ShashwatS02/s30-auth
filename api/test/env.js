"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
if (fs_1.default.existsSync(".env.test")) {
    dotenv_1.default.config({ path: ".env.test" });
}
process.env.NODE_ENV = "test";
