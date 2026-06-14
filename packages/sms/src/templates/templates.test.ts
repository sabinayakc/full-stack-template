import { describe, expect, it } from "vitest";
import { generalSms } from "./general";
import { otpSms } from "./otp";

describe("sms templates", () => {
  it("renders a general message as-is", () => {
    expect(generalSms({ body: "Hello there" })).toBe("Hello there");
  });

  it("renders an OTP message with the code", () => {
    const msg = otpSms({ code: "123456" });
    expect(msg).toContain("123456");
    expect(msg.toLowerCase()).toContain("verification code");
  });
});
