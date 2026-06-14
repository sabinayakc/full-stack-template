import { describe, expect, it, vi } from "vitest";
import type { SmsProviderConfig } from "../types";
import { TwilioSmsProvider } from "./twilio";

const mockCreate = vi.fn();
const mockValidateRequest = vi.fn();
const mockAccountCreate = vi.fn();
const mockAccountFetch = vi.fn();

vi.mock("twilio", () => {
  const twilioFn = () => ({
    messages: { create: mockCreate },
    api: {
      accounts: Object.assign((sid: string) => ({ fetch: () => mockAccountFetch(sid) }), {
        create: mockAccountCreate,
      }),
    },
  });
  twilioFn.validateRequest = (...args: unknown[]) => mockValidateRequest(...args);
  return { default: twilioFn };
});

const BASE_CONFIG: SmsProviderConfig = {
  provider: "twilio",
  accountSid: "AC_test_sid",
  authToken: "test_auth_token",
  fromNumber: "+15551234567",
};

describe("TwilioSmsProvider", () => {
  describe("info", () => {
    it("reports twilio as implemented with inbound support", () => {
      const provider = new TwilioSmsProvider(BASE_CONFIG);
      expect(provider.info).toEqual({
        id: "twilio",
        displayName: "Twilio",
        implemented: true,
        supportsInbound: true,
      });
    });
  });

  describe("sendSms", () => {
    it("sends a message using from number", async () => {
      mockCreate.mockResolvedValue({ sid: "SM_test_123", status: "queued" });
      const provider = new TwilioSmsProvider(BASE_CONFIG);

      const result = await provider.sendSms({
        to: "+15559876543",
        body: "Test message",
      });

      expect(mockCreate).toHaveBeenCalledWith({
        to: "+15559876543",
        body: "Test message",
        from: "+15551234567",
      });
      expect(result).toEqual({
        externalMessageId: "SM_test_123",
        status: "queued",
      });
    });

    it("uses messagingServiceSid when configured", async () => {
      mockCreate.mockResolvedValue({ sid: "SM_test_456", status: "queued" });
      const provider = new TwilioSmsProvider({
        ...BASE_CONFIG,
        messagingServiceSid: "MG_test_service",
      });

      await provider.sendSms({ to: "+15559876543", body: "Test" });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ messagingServiceSid: "MG_test_service" }),
      );
      expect(mockCreate).toHaveBeenCalledWith(
        expect.not.objectContaining({ from: expect.anything() }),
      );
    });

    it("includes statusCallback when provided", async () => {
      mockCreate.mockResolvedValue({ sid: "SM_test_789", status: "queued" });
      const provider = new TwilioSmsProvider(BASE_CONFIG);

      await provider.sendSms({
        to: "+15559876543",
        body: "Test",
        statusCallbackUrl: "https://example.com/webhook",
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ statusCallback: "https://example.com/webhook" }),
      );
    });

    it("returns failed status when Twilio reports failure", async () => {
      mockCreate.mockResolvedValue({ sid: "SM_fail", status: "failed" });
      const provider = new TwilioSmsProvider(BASE_CONFIG);

      const result = await provider.sendSms({ to: "+15559876543", body: "Test" });
      expect(result.status).toBe("failed");
    });

    it("throws when credentials are missing", async () => {
      const provider = new TwilioSmsProvider({ provider: "twilio" });
      await expect(provider.sendSms({ to: "+1", body: "Test" })).rejects.toThrow(
        "Twilio credentials not configured",
      );
    });

    it("throws when no from number or messaging service configured", async () => {
      const provider = new TwilioSmsProvider({
        provider: "twilio",
        accountSid: "AC_test",
        authToken: "token",
      });

      await expect(provider.sendSms({ to: "+1", body: "Test" })).rejects.toThrow(
        "Twilio requires either TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID",
      );
    });
  });

  describe("verifyWebhookSignature", () => {
    it("delegates to twilio validateRequest", async () => {
      mockValidateRequest.mockReturnValue(true);
      const provider = new TwilioSmsProvider(BASE_CONFIG);

      const result = await provider.verifyWebhookSignature(
        "MessageSid=SM123&To=%2B1555",
        "sig_value",
        "https://example.com/webhook",
      );

      expect(result).toBe(true);
      expect(mockValidateRequest).toHaveBeenCalledWith(
        "test_auth_token",
        "sig_value",
        "https://example.com/webhook",
        { MessageSid: "SM123", To: "+1555" },
      );
    });

    it("returns false when authToken is missing", async () => {
      const provider = new TwilioSmsProvider({ provider: "twilio" });
      const result = await provider.verifyWebhookSignature("body", "sig", "url");
      expect(result).toBe(false);
    });
  });

  describe("parseDeliveryStatus", () => {
    it("parses delivered status", () => {
      const provider = new TwilioSmsProvider(BASE_CONFIG);
      const event = provider.parseDeliveryStatus({
        MessageSid: "SM123",
        To: "+15559876543",
        MessageStatus: "delivered",
      });

      expect(event).toEqual({
        externalMessageId: "SM123",
        to: "+15559876543",
        status: "delivered",
        errorCode: undefined,
        errorMessage: undefined,
      });
    });

    it("parses undelivered status", () => {
      const provider = new TwilioSmsProvider(BASE_CONFIG);
      const event = provider.parseDeliveryStatus({
        MessageSid: "SM456",
        To: "+15559876543",
        MessageStatus: "undelivered",
        ErrorCode: "30003",
        ErrorMessage: "Unreachable",
      });

      expect(event).toEqual({
        externalMessageId: "SM456",
        to: "+15559876543",
        status: "undelivered",
        errorCode: "30003",
        errorMessage: "Unreachable",
      });
    });

    it("maps unknown statuses to failed", () => {
      const provider = new TwilioSmsProvider(BASE_CONFIG);
      const event = provider.parseDeliveryStatus({
        MessageSid: "SM789",
        To: "+1",
        MessageStatus: "something_unknown",
      });

      expect(event.status).toBe("failed");
    });
  });

  describe("createSubAccount", () => {
    it("creates a Twilio sub-account with friendly name", async () => {
      mockAccountCreate.mockResolvedValue({
        sid: "AC_sub_123",
        authToken: "sub_auth_token_456",
      });
      const provider = new TwilioSmsProvider(BASE_CONFIG);

      const result = await provider.createSubAccount({
        friendlyName: "Acme Roofing",
        organizationId: "org-abc",
      });

      expect(mockAccountCreate).toHaveBeenCalledWith({
        friendlyName: "App | Acme Roofing (org-abc)",
      });
      expect(result).toEqual({
        externalAccountSid: "AC_sub_123",
        authToken: "sub_auth_token_456",
      });
    });
  });

  describe("getSubAccountStatus", () => {
    it("returns active status", async () => {
      mockAccountFetch.mockResolvedValue({
        sid: "AC_sub_123",
        friendlyName: "App | Acme Roofing",
        status: "active",
      });
      const provider = new TwilioSmsProvider(BASE_CONFIG);

      const result = await provider.getSubAccountStatus("AC_sub_123");

      expect(result).toEqual({
        externalAccountSid: "AC_sub_123",
        friendlyName: "App | Acme Roofing",
        status: "active",
      });
    });

    it("maps suspended status", async () => {
      mockAccountFetch.mockResolvedValue({
        sid: "AC_sub_456",
        friendlyName: "Test Org",
        status: "suspended",
      });
      const provider = new TwilioSmsProvider(BASE_CONFIG);

      const result = await provider.getSubAccountStatus("AC_sub_456");
      expect(result.status).toBe("suspended");
    });

    it("maps closed/unknown status to closed", async () => {
      mockAccountFetch.mockResolvedValue({
        sid: "AC_sub_789",
        friendlyName: "Test Org",
        status: "closed",
      });
      const provider = new TwilioSmsProvider(BASE_CONFIG);

      const result = await provider.getSubAccountStatus("AC_sub_789");
      expect(result.status).toBe("closed");
    });
  });
});
