import { describe, expect, it } from "vitest";
import { createApp } from "./hono";

describe("createApp", () => {
  it("rejects requests when no authenticated user is set", async () => {
    const app = createApp();

    app.get("/protected", (c) => c.json({ ok: true }));

    const response = await app.request("/protected");

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });
});
