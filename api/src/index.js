"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.get("/", (_req, res) => {
    res.status(200).send("OK. Try /health");
});
app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
});
app.listen(PORT, () => {
    console.log(`API listening on port ${PORT}`);
});
//# sourceMappingURL=index.js.map