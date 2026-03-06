"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const db_1 = require("../src/db");
const resetDb_1 = require("./resetDb");
jest.setTimeout(60000);
const app = (0, app_1.makeApp)();
const pw = "Password@12345";
function uniqEmail(prefix = "user") {
    return `${prefix}.${Date.now()}.${Math.random().toString(16).slice(2)}@example.com`;
}
beforeEach(async () => {
    await (0, resetDb_1.resetDb)();
});
afterAll(async () => {
    await db_1.pool.end();
});
test("Full auth flow: register -> login -> /me -> refresh -> logout", async () => {
    const REQ_TIMEOUT = { response: 8000, deadline: 10000 };
    const email = uniqEmail("flow");
    const agent = supertest_1.default.agent(app);
    try {
        const reg = await agent
            .post("/auth/register")
            .send({ email, password: pw })
            .timeout(REQ_TIMEOUT);
        expect(reg.status).toBe(201);
        expect(reg.body?.user?.email).toBe(email);
        const login = await agent
            .post("/auth/login")
            .send({ email, password: pw })
            .timeout(REQ_TIMEOUT);
        expect(login.status).toBe(200);
        expect(typeof login.body?.accessToken).toBe("string");
        const me = await agent
            .get("/me")
            .set("Authorization", `Bearer ${login.body.accessToken}`)
            .timeout(REQ_TIMEOUT);
        expect(me.status).toBe(200);
        expect(me.body?.user?.email).toBe(email);
        const refresh = await agent
            .post("/auth/refresh")
            .send()
            .timeout(REQ_TIMEOUT);
        expect(refresh.status).toBe(200);
        expect(typeof refresh.body?.accessToken).toBe("string");
        const logout = await agent
            .post("/auth/logout")
            .send()
            .timeout(REQ_TIMEOUT);
        expect(logout.status).toBe(204);
        const refreshAfterLogout = await agent
            .post("/auth/refresh")
            .send()
            .timeout(REQ_TIMEOUT);
        expect(refreshAfterLogout.status).toBe(401);
    }
    finally {
        await agent.close?.(); // best-effort
    }
});
test("Rate limit: 6th wrong login returns 429", async () => {
    const REQ_TIMEOUT = { response: 8000, deadline: 10000 };
    const email = uniqEmail("ratelimit");
    const reg = await (0, supertest_1.default)(app)
        .post("/auth/register")
        .send({ email, password: pw })
        .timeout(REQ_TIMEOUT);
    expect(reg.status).toBe(201);
    for (let i = 1; i <= 5; i++) {
        const r = await (0, supertest_1.default)(app)
            .post("/auth/login")
            .send({ email, password: "wrong" })
            .timeout(REQ_TIMEOUT);
        expect(r.status).toBe(401);
    }
    const sixth = await (0, supertest_1.default)(app)
        .post("/auth/login")
        .send({ email, password: "wrong" })
        .timeout(REQ_TIMEOUT);
    expect(sixth.status).toBe(429);
});
