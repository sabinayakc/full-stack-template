import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { ConfigService } from "./config-service";

const ORIGINAL_ENV = { ...process.env };

function resetConfigServiceSingleton() {
  (ConfigService as unknown as { instance?: ConfigService }).instance = undefined;
}

describe("ConfigService", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    resetConfigServiceSingleton();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
    resetConfigServiceSingleton();
  });

  it("defaults DATABASE_URL to empty string when missing", () => {
    delete process.env.DATABASE_URL;
    process.env.CLIENT_URL = "http://localhost:8081";

    const config = ConfigService.getInstance();
    expect(config.getDatabaseUrl()).toBe("");
  });

  it("throws when CLIENT_URL is missing", () => {
    process.env.DATABASE_URL = "postgres://localhost/app";
    delete process.env.CLIENT_URL;

    expect(() => ConfigService.getInstance()).toThrow(
      "CLIENT_URL environment variable is not set.",
    );
  });

  it("loads defaults for optional environment values", () => {
    process.env.DATABASE_URL = "postgres://localhost/app";
    process.env.CLIENT_URL = "http://localhost:8081";
    delete process.env.SERVER_PORT;
    delete process.env.AWS_BEDROCK_REGION;

    const config = ConfigService.getInstance();

    expect(config.getDatabaseUrl()).toBe("postgres://localhost/app");
    expect(config.getClientUrl()).toBe("http://localhost:8081");
    expect(config.getPort()).toBe(4000);
    expect(config.getBedrockRegion()).toBe("us-east-1");
    expect(config.getS3Config()).toMatchObject({
      endpoint: "http://localhost:4566",
      accessKeyId: "test",
      secretAccessKey: "test",
      region: "us-east-1",
      bucket: "app-uploads",
    });
  });

  it("loads configured SMS provider settings", () => {
    process.env.DATABASE_URL = "postgres://localhost/app";
    process.env.CLIENT_URL = "http://localhost:8081";
    process.env.SMS_PROVIDER = "twilio";
    process.env.TWILIO_ACCOUNT_SID = "sid";
    process.env.TWILIO_AUTH_TOKEN = "token";
    process.env.TWILIO_FROM_NUMBER = "+15555550100";

    const config = ConfigService.getInstance();

    expect(config.getSmsProviderConfig()).toEqual({
      provider: "twilio",
      accountSid: "sid",
      authToken: "token",
      fromNumber: "+15555550100",
      messagingServiceSid: undefined,
    });
  });
});
