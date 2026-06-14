import { fireEvent, waitFor } from "@testing-library/react-native";
import TwoFactorVerifyScreen from "@/app/(auth)/two-factor-verify";
import { render } from "@/test/utils";

const mockVerifyTotp = jest.fn();
const mockSendOtp = jest.fn();
const mockVerifyOtp = jest.fn();
const mockVerifyBackupCode = jest.fn();
jest.mock("@/lib/auth", () => ({
  authClient: {
    twoFactor: {
      verifyTotp: (...args: unknown[]) => mockVerifyTotp(...args),
      sendOtp: (...args: unknown[]) => mockSendOtp(...args),
      verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
      verifyBackupCode: (...args: unknown[]) => mockVerifyBackupCode(...args),
    },
  },
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

import type React from "react";

describe("TwoFactorVerifyScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders header and tabs", () => {
    const { getByText, getByTestId } = render(<TwoFactorVerifyScreen />);
    expect(getByText("Two-Factor Verification")).toBeTruthy();
    expect(getByTestId("2fa-tab-totp")).toBeTruthy();
    expect(getByTestId("2fa-tab-otp")).toBeTruthy();
    expect(getByTestId("2fa-tab-sms")).toBeTruthy();
  });

  it("defaults to TOTP tab", () => {
    const { getByText } = render(<TwoFactorVerifyScreen />);
    expect(getByText("Enter the 6-digit code from your authenticator app")).toBeTruthy();
  });

  it("renders return to sign in link", () => {
    const { getByText } = render(<TwoFactorVerifyScreen />);
    expect(getByText("Return to")).toBeTruthy();
    expect(getByText("Sign In")).toBeTruthy();
  });

  it("renders backup code fallback link", () => {
    const { getByText } = render(<TwoFactorVerifyScreen />);
    expect(getByText("Having trouble? Use a backup code")).toBeTruthy();
  });

  it("switches to email OTP tab", () => {
    const { getByTestId, getByText } = render(<TwoFactorVerifyScreen />);
    fireEvent.press(getByTestId("2fa-tab-otp"));
    expect(getByText("Send Verification Code")).toBeTruthy();
  });

  it("sends email OTP on button press", async () => {
    mockSendOtp.mockResolvedValue({ data: {} });
    const { getByTestId, getByText } = render(<TwoFactorVerifyScreen />);
    fireEvent.press(getByTestId("2fa-tab-otp"));
    fireEvent.press(getByText("Send Verification Code"));

    await waitFor(() => {
      expect(mockSendOtp).toHaveBeenCalledWith(
        expect.objectContaining({
          fetchOptions: { headers: { "x-otp-channel": "email" } },
        }),
      );
    });
  });

  it("switches to SMS tab and sends SMS OTP", async () => {
    mockSendOtp.mockResolvedValue({ data: {} });
    const { getByTestId, getByText } = render(<TwoFactorVerifyScreen />);
    fireEvent.press(getByTestId("2fa-tab-sms"));
    expect(getByText("We'll send a verification code to your phone number")).toBeTruthy();
    fireEvent.press(getByText("Send Verification Code"));

    await waitFor(() => {
      expect(mockSendOtp).toHaveBeenCalledWith(
        expect.objectContaining({
          fetchOptions: { headers: { "x-otp-channel": "sms" } },
        }),
      );
    });
  });

  it("shows backup code screen when fallback is pressed", () => {
    const { getByText, getByTestId } = render(<TwoFactorVerifyScreen />);
    fireEvent.press(getByText("Having trouble? Use a backup code"));
    expect(getByText("Use Backup Code")).toBeTruthy();
    expect(getByTestId("2fa-verify-backup-input")).toBeTruthy();
  });

  it("calls verifyBackupCode on submit", async () => {
    mockVerifyBackupCode.mockResolvedValue({ data: {} });
    const { getByText, getByTestId } = render(<TwoFactorVerifyScreen />);
    fireEvent.press(getByText("Having trouble? Use a backup code"));
    fireEvent.changeText(getByTestId("2fa-verify-backup-input"), "abc123def");
    fireEvent.press(getByText("Verify"));

    await waitFor(() => {
      expect(mockVerifyBackupCode).toHaveBeenCalledWith(
        expect.objectContaining({ code: "abc123def" }),
      );
    });
  });

  it("navigates back from backup screen to verification methods", () => {
    const { getByText } = render(<TwoFactorVerifyScreen />);
    fireEvent.press(getByText("Having trouble? Use a backup code"));
    expect(getByText("Use Backup Code")).toBeTruthy();
    fireEvent.press(getByText("Back to verification methods"));
    expect(getByText("Two-Factor Verification")).toBeTruthy();
  });

  it("shows error on failed TOTP verification", async () => {
    mockVerifyTotp.mockResolvedValue({ error: { message: "Invalid code" } });
    const { getByTestId, getByText } = render(<TwoFactorVerifyScreen />);

    const firstDigit = getByTestId("2fa-verify-totp-digit-0");
    fireEvent.changeText(firstDigit, "123456");

    await waitFor(() => {
      expect(mockVerifyTotp).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(getByText("Invalid code")).toBeTruthy();
    });
  });

  it("renders trust device checkbox", () => {
    const { getByText } = render(<TwoFactorVerifyScreen />);
    expect(getByText("Trust this device for 30 days")).toBeTruthy();
  });
});
