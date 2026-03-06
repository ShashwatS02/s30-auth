"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDb = resetDb;
// test/resetDb.ts
const db_1 = require("../src/db");
async function resetDb() {
    // sessions references users, so truncate both with cascade
    await db_1.pool.query("TRUNCATE TABLE sessions, users CASCADE");
}
