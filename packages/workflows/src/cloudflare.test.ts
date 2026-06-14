import { afterEach, describe, expect, it } from "vitest";
import { setupBindings } from "./cloudflare";

describe("setupBindings", () => {
  afterEach(() => {
    const g = globalThis as Record<string, unknown>;
    delete g.HYPERDRIVE;
    delete g.__cfKV;
    delete g.__cfR2;
    delete g.__cfEnv;
  });

  it("stashes HYPERDRIVE on globalThis", () => {
    const env = {
      HYPERDRIVE: { connectionString: "postgres://localhost/test" },
      KV: {} as KVNamespace,
      R2: {},
    };

    setupBindings(env);

    expect((globalThis as Record<string, unknown>).HYPERDRIVE).toBe(env.HYPERDRIVE);
  });

  it("stashes KV as __cfKV on globalThis", () => {
    const kv = {} as KVNamespace;
    const env = {
      HYPERDRIVE: { connectionString: "" },
      KV: kv,
      R2: {},
    };

    setupBindings(env);

    expect((globalThis as Record<string, unknown>).__cfKV).toBe(kv);
  });

  it("stashes R2 as __cfR2 on globalThis", () => {
    const r2 = { bucket: "test" };
    const env = {
      HYPERDRIVE: { connectionString: "" },
      KV: {} as KVNamespace,
      R2: r2,
    };

    setupBindings(env);

    expect((globalThis as Record<string, unknown>).__cfR2).toBe(r2);
  });

  it("stashes the full env as __cfEnv on globalThis", () => {
    const env = {
      HYPERDRIVE: { connectionString: "" },
      KV: {} as KVNamespace,
      R2: {},
    };

    setupBindings(env);

    expect((globalThis as Record<string, unknown>).__cfEnv).toBe(env);
  });
});
