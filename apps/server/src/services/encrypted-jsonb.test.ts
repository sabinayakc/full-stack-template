import { decrypt, encrypt, parseKey } from "@repo/db";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const TEST_HEX = "ab".repeat(32);
const KEY = parseKey(TEST_HEX);

describe("encryptedJsonb round-trip (simulated toDriver/fromDriver)", () => {
  beforeEach(() => {
    (globalThis as Record<string, unknown>).__encryptionKey = TEST_HEX;
  });

  afterEach(() => {
    delete (globalThis as Record<string, unknown>).__encryptionKey;
  });

  function toDriver(value: Record<string, unknown>): string {
    return encrypt(JSON.stringify(value), KEY);
  }

  function fromDriver(value: string): Record<string, unknown> {
    if (!value) return {};
    return JSON.parse(decrypt(value, KEY));
  }

  it("toDriver produces an encrypted envelope", () => {
    const result = toDriver({ accessToken: "tok_123" });
    expect(result.startsWith("enc:v1:")).toBe(true);
  });

  it("fromDriver decrypts back to original object", () => {
    const original = { accessToken: "tok_123", refreshToken: "ref_456" };
    const encrypted = toDriver(original);
    const decrypted = fromDriver(encrypted);
    expect(decrypted).toEqual(original);
  });

  it("fromDriver returns empty object for falsy value", () => {
    expect(fromDriver("")).toEqual({});
  });

  it("round-trips QuickBooks-shaped credentials", () => {
    const credentials = {
      accessToken: "eyJhbGciOiJkaXIi...",
      refreshToken: "AB11694200123...",
      tokenType: "bearer",
      scope: "com.intuit.quickbooks.accounting",
    };
    const encrypted = toDriver(credentials);
    const decrypted = fromDriver(encrypted);
    expect(decrypted).toEqual(credentials);
  });

  it("different encryptions of same object are not equal", () => {
    const creds = { apiKey: "secret_key_123" };
    const a = toDriver(creds);
    const b = toDriver(creds);
    expect(a).not.toBe(b);
    expect(fromDriver(a)).toEqual(creds);
    expect(fromDriver(b)).toEqual(creds);
  });

  it("decrypt with wrong key fails", () => {
    const encrypted = toDriver({ secret: "data" });
    const wrongKey = parseKey("cd".repeat(32));
    expect(() => JSON.parse(decrypt(encrypted, wrongKey))).toThrow();
  });
});
