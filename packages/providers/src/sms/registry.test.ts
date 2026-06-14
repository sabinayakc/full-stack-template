import { describe, expect, it } from "vitest";
import { UnsupportedSmsProvider } from "./provider";
import { TwilioSmsProvider } from "./providers/twilio";
import { createSmsProvider } from "./registry";

describe("createSmsProvider", () => {
  it("returns TwilioSmsProvider for twilio", () => {
    const provider = createSmsProvider({ provider: "twilio" });
    expect(provider).toBeInstanceOf(TwilioSmsProvider);
    expect(provider.info.id).toBe("twilio");
  });

  it("returns NoopSmsProvider for none", () => {
    const provider = createSmsProvider({ provider: "none" });
    expect(provider.info.id).toBe("none");
    expect(provider.info.displayName).toBe("Disabled");
    expect(provider.info.implemented).toBe(true);
  });

  it("noop provider throws on sendSms", async () => {
    const provider = createSmsProvider({ provider: "none" });
    await expect(provider.sendSms({ to: "+1", body: "test" })).rejects.toThrow(
      "No SMS provider configured",
    );
  });

  it("returns UnsupportedSmsProvider for unknown provider", () => {
    const provider = createSmsProvider({ provider: "unknown" as "twilio" });
    expect(provider).toBeInstanceOf(UnsupportedSmsProvider);
    expect(provider.info.implemented).toBe(false);
  });
});
