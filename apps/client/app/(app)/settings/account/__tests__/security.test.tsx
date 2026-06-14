import { fireEvent, waitFor } from "@testing-library/react-native";
import SecurityScreen from "@/app/(app)/settings/account/security";
import { render } from "@/test/utils";

const mockConfirm = jest.fn().mockResolvedValue(true);
jest.mock("@/components/ui/confirm-dialog", () => ({
  confirm: (...args: unknown[]) => mockConfirm(...args),
}));

const mockRequestPasswordReset = jest.fn().mockResolvedValue({});
jest.mock("@/lib/auth", () => ({
  authClient: {
    requestPasswordReset: (...args: unknown[]) => mockRequestPasswordReset(...args),
  },
}));

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockUseAuth = jest.fn(() => ({
  user: { email: "test@example.com", twoFactorEnabled: false },
}));
jest.mock("@/providers/auth-provider", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn() }),
}));

describe("SecurityScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { email: "test@example.com", twoFactorEnabled: false },
    });
  });

  it("renders password section", () => {
    const { getByText } = render(<SecurityScreen />);
    expect(getByText("Change Password")).toBeTruthy();
    expect(getByText("Password")).toBeTruthy();
  });

  it("shows confirmation dialog before sending password reset", async () => {
    const { getByText } = render(<SecurityScreen />);
    fireEvent.press(getByText("Change Password"));
    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Reset Password",
          confirmLabel: "Send Link",
        }),
      );
    });
  });

  it("sends password reset after confirmation", async () => {
    mockConfirm.mockResolvedValue(true);
    const { getByText } = render(<SecurityScreen />);
    fireEvent.press(getByText("Change Password"));
    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith({ email: "test@example.com" });
    });
  });

  it("does not send password reset if confirmation is cancelled", async () => {
    mockConfirm.mockResolvedValue(false);
    const { getByText } = render(<SecurityScreen />);
    fireEvent.press(getByText("Change Password"));
    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
    });
    expect(mockRequestPasswordReset).not.toHaveBeenCalled();
  });

  it("renders 2FA section", () => {
    const { getAllByText, getByText } = render(<SecurityScreen />);
    expect(getAllByText("Two-Factor Authentication").length).toBeGreaterThanOrEqual(1);
    expect(getByText("Add an extra layer of security")).toBeTruthy();
  });

  it("shows enabled status when 2FA is on", () => {
    mockUseAuth.mockReturnValue({
      user: { email: "test@example.com", twoFactorEnabled: true },
    });
    const { getByText } = render(<SecurityScreen />);
    expect(getByText(/Enabled — Authenticator, Email/)).toBeTruthy();
    expect(getByText("On")).toBeTruthy();
  });

  it("navigates to setup screen when 2FA is disabled", () => {
    const { getByText } = render(<SecurityScreen />);
    fireEvent.press(getByText("Add an extra layer of security"));
    expect(mockPush).toHaveBeenCalledWith("/(app)/settings/account/two-factor-setup");
  });

  it("navigates to manage screen when 2FA is enabled", () => {
    mockUseAuth.mockReturnValue({
      user: { email: "test@example.com", twoFactorEnabled: true },
    });
    const { getByText } = render(<SecurityScreen />);
    fireEvent.press(getByText(/Enabled — Authenticator, Email/));
    expect(mockPush).toHaveBeenCalledWith("/(app)/settings/account/two-factor-manage");
  });

  it("renders active sessions section", () => {
    const { getByText } = render(<SecurityScreen />);
    expect(getByText("Active Sessions")).toBeTruthy();
    expect(getByText("Manage your signed-in devices")).toBeTruthy();
  });

  it("navigates to sessions screen", () => {
    const { getByText } = render(<SecurityScreen />);
    fireEvent.press(getByText("Active Sessions"));
    expect(mockPush).toHaveBeenCalledWith("/(app)/settings/account/sessions");
  });
});
