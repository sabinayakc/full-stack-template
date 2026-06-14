import { fireEvent, waitFor } from "@testing-library/react-native";
import TwoFactorManageScreen from "@/app/(app)/settings/account/two-factor-manage";
import { render } from "@/test/utils";

const mockPrompt = jest.fn().mockResolvedValue("password123");
jest.mock("@/components/ui/confirm-dialog", () => ({
  prompt: (...args: unknown[]) => mockPrompt(...args),
}));

const mockGenerateBackupCodes = jest.fn();
const mockDisable = jest.fn();
jest.mock("@/lib/auth", () => ({
  authClient: {
    twoFactor: {
      generateBackupCodes: (...args: unknown[]) => mockGenerateBackupCodes(...args),
      disable: (...args: unknown[]) => mockDisable(...args),
    },
  },
}));

const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
}));

const mockToast = { success: jest.fn(), error: jest.fn() };
jest.mock("@/providers/toast-provider", () => ({
  useToast: () => mockToast,
}));

describe("TwoFactorManageScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders enabled status banner", () => {
    const { getByText } = render(<TwoFactorManageScreen />);
    expect(getByText("Two-factor authentication is enabled")).toBeTruthy();
  });

  it("renders methods section", () => {
    const { getByText } = render(<TwoFactorManageScreen />);
    expect(getByText("Authenticator App")).toBeTruthy();
    expect(getByText("Email OTP")).toBeTruthy();
    expect(getByText("Available")).toBeTruthy();
  });

  it("renders recovery section", () => {
    const { getByText } = render(<TwoFactorManageScreen />);
    expect(getByText("Backup Codes")).toBeTruthy();
    expect(getByText("Disable Two-Factor")).toBeTruthy();
  });

  it("navigates to reconfigure wizard on authenticator press", () => {
    const { getByText } = render(<TwoFactorManageScreen />);
    fireEvent.press(getByText("Authenticator App"));
    expect(mockPush).toHaveBeenCalledWith(
      "/(app)/settings/account/two-factor-setup?mode=reconfigure",
    );
  });

  it("prompts for password and regenerates backup codes", async () => {
    mockGenerateBackupCodes.mockResolvedValue({
      data: { backupCodes: ["abc123", "def456"] },
    });

    const { getByText } = render(<TwoFactorManageScreen />);
    fireEvent.press(getByText("Backup Codes"));

    await waitFor(() => {
      expect(mockPrompt).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Regenerate Backup Codes" }),
      );
    });

    await waitFor(() => {
      expect(mockGenerateBackupCodes).toHaveBeenCalledWith({ password: "password123" });
    });

    await waitFor(() => {
      expect(getByText("New Backup Codes")).toBeTruthy();
    });
  });

  it("prompts for password to disable 2FA", async () => {
    mockDisable.mockResolvedValue({ data: {} });

    const { getByText } = render(<TwoFactorManageScreen />);
    fireEvent.press(getByText("Disable Two-Factor"));

    await waitFor(() => {
      expect(mockPrompt).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Disable Two-Factor Authentication" }),
      );
    });

    await waitFor(() => {
      expect(mockDisable).toHaveBeenCalledWith({ password: "password123" });
    });
  });

  it("navigates back after disabling 2FA", async () => {
    mockDisable.mockResolvedValue({ data: {} });

    const { getByText } = render(<TwoFactorManageScreen />);
    fireEvent.press(getByText("Disable Two-Factor"));

    await waitFor(() => {
      expect(mockBack).toHaveBeenCalled();
    });
  });

  it("does not disable when prompt is cancelled", async () => {
    mockPrompt.mockResolvedValueOnce(null);

    const { getByText } = render(<TwoFactorManageScreen />);
    fireEvent.press(getByText("Disable Two-Factor"));

    await waitFor(() => {
      expect(mockPrompt).toHaveBeenCalled();
    });
    expect(mockDisable).not.toHaveBeenCalled();
  });
});
