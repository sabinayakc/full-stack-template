import { decrypt, encrypt, isEncrypted, parseKey } from "@repo/db";
import { describe, expect, it } from "vitest";

const VALID_HEX = "ab".repeat(32);
const KEY = parseKey(VALID_HEX);

describe("parseKey", () => {
  it("accepts a 64-char hex string", () => {
    const key = parseKey(VALID_HEX);
    expect(key).toBeInstanceOf(Buffer);
    expect(key.length).toBe(32);
  });

  it("rejects a short key", () => {
    expect(() => parseKey("abcd")).toThrow("64 hex characters");
  });

  it("rejects a long key", () => {
    expect(() => parseKey("ab".repeat(33))).toThrow("64 hex characters");
  });

  it("rejects non-hex characters", () => {
    expect(() => parseKey("zz".repeat(32))).toThrow("64 hex characters");
  });
});

describe("encrypt / decrypt", () => {
  it("round-trips a simple string", () => {
    const plaintext = "hello world";
    const encrypted = encrypt(plaintext, KEY);
    expect(encrypted.startsWith("enc:v1:")).toBe(true);
    expect(decrypt(encrypted, KEY)).toBe(plaintext);
  });

  it("round-trips a JSON object", () => {
    const obj = { accessToken: "tok_123", refreshToken: "ref_456", nested: { a: 1 } };
    const json = JSON.stringify(obj);
    const encrypted = encrypt(json, KEY);
    expect(JSON.parse(decrypt(encrypted, KEY))).toEqual(obj);
  });

  it("round-trips empty JSON object", () => {
    const encrypted = encrypt("{}", KEY);
    expect(decrypt(encrypted, KEY)).toBe("{}");
  });

  it("produces different ciphertext each time (random IV)", () => {
    const plaintext = "same input";
    const a = encrypt(plaintext, KEY);
    const b = encrypt(plaintext, KEY);
    expect(a).not.toBe(b);
    expect(decrypt(a, KEY)).toBe(plaintext);
    expect(decrypt(b, KEY)).toBe(plaintext);
  });

  it("throws on decrypt with wrong key", () => {
    const encrypted = encrypt("secret", KEY);
    const wrongKey = parseKey("cd".repeat(32));
    expect(() => decrypt(encrypted, wrongKey)).toThrow();
  });

  it("throws on tampered ciphertext", () => {
    const encrypted = encrypt("secret", KEY);
    const prefix = "enc:v1:";
    const payload = Buffer.from(encrypted.slice(prefix.length), "base64");
    payload[20] ^= 0xff;
    const tampered = prefix + payload.toString("base64");
    expect(() => decrypt(tampered, KEY)).toThrow();
  });

  it("throws on missing enc:v1: prefix", () => {
    expect(() => decrypt("not-encrypted", KEY)).toThrow("missing enc:v1: prefix");
  });
});

describe("isEncrypted", () => {
  it("returns true for encrypted envelope", () => {
    expect(isEncrypted("enc:v1:abc123")).toBe(true);
  });

  it("returns false for plain JSON", () => {
    expect(isEncrypted('{"accessToken":"tok"}')).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isEncrypted("")).toBe(false);
  });
});
