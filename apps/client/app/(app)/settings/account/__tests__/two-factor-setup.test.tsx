import { fireEvent, waitFor } from "@testing-library/react-native";
import TwoFactorSetupScreen from "@/app/(app)/settings/account/two-factor-setup";
import { render } from "@/test/utils";

const mockEnable = jest.fn();
const mockVerifyTotp = jest.fn();
const mockGetTotpUri = jest.fn();
jest.mock("@/lib/auth", () => ({
  authClient: {
    twoFactor: {
      enable: (...args: unknown[]) => mockEnable(...args),
      verifyTotp: (...args: unknown[]) => mockVerifyTotp(...args),
      getTotpUri: (...args: unknown[]) => mockGetTotpUri(...args),
    },
  },
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn() }),
  useLocalSearchParams: () => mockSearchParams,
}));

jest.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn() }),
}));

jest.mock("react-native-qrcode-svg", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (props: { value: string }) => <View testID="qr-code" />,
  };
});

let mockSearchParams: { mode?: string } = {};

describe("TwoFactorSetupScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = {};
  });

  it("renders password verification step", () => {
    const { getByText, getByTestId } = render(<TwoFactorSetupScreen />);
    expect(getByText("Verify Your Identity")).toBeTruthy();
    expect(getByTestId("2fa-setup-password")).toBeTruthy();
  });

  it("renders step counter", () => {
    const { getByText } = render(<TwoFactorSetupScreen />);
    expect(getByText(/Step 1 of/)).toBeTruthy();
  });

  it("calls enable with password on next", async () => {
    mockEnable.mockResolvedValue({
      data: {
        totpURI: "otpauth://totp/App:test@test.com?secret=JBSWY3DPEHPK3PXP&issuer=App",
        backupCodes: ["code1", "code2", "code3"],
      },
    });

    const { getByTestId, getByText } = render(<TwoFactorSetupScreen />);
    const passwordInput = getByTestId("2fa-setup-password");
    fireEvent.changeText(passwordInput, "mypassword");
    fireEvent.press(getByText("Next"));

    await waitFor(() => {
      expect(mockEnable).toHaveBeenCalledWith({ password: "mypassword" });
    });
  });

  it("shows method selection after password verification", async () => {
    mockEnable.mockResolvedValue({
      data: {
        totpURI: "otpauth://totp/App:test@test.com?secret=JBSWY3DPEHPK3PXP&issuer=App",
        backupCodes: ["code1", "code2"],
      },
    });

    const { getByTestId, getByText } = render(<TwoFactorSetupScreen />);
    fireEvent.changeText(getByTestId("2fa-setup-password"), "mypassword");
    fireEvent.press(getByText("Next"));

    await waitFor(() => {
      expect(getByText("Choose Your Method")).toBeTruthy();
    });
    expect(getByTestId("2fa-method-totp")).toBeTruthy();
    expect(getByTestId("2fa-method-otp")).toBeTruthy();
  });

  it("shows error on invalid password", async () => {
    mockEnable.mockResolvedValue({
      error: { message: "Incorrect password" },
    });

    const { getByTestId, getByText, getAllByText } = render(<TwoFactorSetupScreen />);
    fireEvent.changeText(getByTestId("2fa-setup-password"), "wrong");
    fireEvent.press(getByText("Next"));

    await waitFor(() => {
      expect(getAllByText("Incorrect password").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("reconfigure mode", () => {
    beforeEach(() => {
      mockSearchParams = { mode: "reconfigure" };
    });

    it("renders password step in reconfigure mode", () => {
      const { getByText, getByTestId } = render(<TwoFactorSetupScreen />);
      expect(getByText("Verify Your Identity")).toBeTruthy();
      expect(getByTestId("2fa-setup-password")).toBeTruthy();
    });

    it("calls getTotpUri instead of enable in reconfigure mode", async () => {
      mockGetTotpUri.mockResolvedValue({
        data: {
          totpURI: "otpauth://totp/App:test@test.com?secret=JBSWY3DPEHPK3PXP&issuer=App",
        },
      });

      const { getByTestId, getByText } = render(<TwoFactorSetupScreen />);
      fireEvent.changeText(getByTestId("2fa-setup-password"), "mypassword");
      fireEvent.press(getByText("Next"));

      await waitFor(() => {
        expect(mockGetTotpUri).toHaveBeenCalledWith({ password: "mypassword" });
      });
      expect(mockEnable).not.toHaveBeenCalled();
    });

    it("shows QR code after password verification in reconfigure mode", async () => {
      mockGetTotpUri.mockResolvedValue({
        data: {
          totpURI: "otpauth://totp/App:test@test.com?secret=JBSWY3DPEHPK3PXP&issuer=App",
        },
      });

      const { getByTestId, getByText } = render(<TwoFactorSetupScreen />);
      fireEvent.changeText(getByTestId("2fa-setup-password"), "mypassword");
      fireEvent.press(getByText("Next"));

      await waitFor(() => {
        expect(getByText("Reconfigure Authenticator")).toBeTruthy();
      });
      expect(getByTestId("qr-code")).toBeTruthy();
    });

    it("does not show method selection in reconfigure mode", async () => {
      mockGetTotpUri.mockResolvedValue({
        data: {
          totpURI: "otpauth://totp/App:test@test.com?secret=JBSWY3DPEHPK3PXP&issuer=App",
        },
      });

      const { getByTestId, getByText, queryByText } = render(<TwoFactorSetupScreen />);
      fireEvent.changeText(getByTestId("2fa-setup-password"), "mypassword");
      fireEvent.press(getByText("Next"));

      await waitFor(() => {
        expect(getByText("Reconfigure Authenticator")).toBeTruthy();
      });
      expect(queryByText("Choose Your Method")).toBeNull();
    });
  });
});
