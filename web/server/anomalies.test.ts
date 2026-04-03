import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("anomalies router", () => {
  it("should return anomaly stats", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.anomalies.stats();

    expect(stats).toBeDefined();
    expect(typeof stats.total_anomalies).toBe("number");
    expect(typeof stats.resolved_anomalies).toBe("number");
    expect(typeof stats.pending_anomalies).toBe("number");
  });
});

describe("blockchain router", () => {
  it("should return blockchain status", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const status = await caller.blockchain.status();

    expect(status).toBeDefined();
    expect(status).toHaveProperty("sync_status");
    expect(status).toHaveProperty("current_block");
  });
});

describe("mission router", () => {
  it("should return mission tagline", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const tagline = await caller.mission.tagline();

    expect(tagline).toBeDefined();
    expect(tagline).toHaveProperty("tagline");
    expect(typeof tagline.tagline).toBe("string");
  });

  it("should return mission statement", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const statement = await caller.mission.statement();

    expect(statement).toBeDefined();
    expect(statement).toHaveProperty("mission");
  });
});
