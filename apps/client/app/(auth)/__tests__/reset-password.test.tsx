import { router, useLocalSearchParams } from "expo-router";
import { mockAuthClient } from "@/test/mocks/auth";
import { fireEvent, render, waitFor } from "@/test/utils";
import ResetPassword from "../reset-password";

const mockToastSuccess = jest.fn();
jest.mock("@/providers/toast-provider", () => ({
  useToast: () => ({
    success: mockToastSuccess,
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  }),
}));

const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

describe("ResetPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders password fields and submit button", () => {
    mockUseLocalSearchParams.mockReturnValue({ token: "valid-token" });

    const { getByText } = render(<ResetPassword />);

    expect(getByText("New Password")).toBeTruthy();
    expect(getByText("Confirm Password")).toBeTruthy();
    expect(getByText("Reset Password")).toBeTruthy();
  });

  it("shows invalid token error from URL params", () => {
    mockUseLocalSearchParams.mockReturnValue({ error: "INVALID_TOKEN" });

    const { getByText } = render(<ResetPassword />);

    expect(getByText("This reset link is invalid or expired.")).toBeTruthy();
  });

  it("disables submit when token is missing", () => {
    mockUseLocalSearchParams.mockReturnValue({});

    const { getByText, getAllByPlaceholderText } = render(<ResetPassword />);

    const passwordInputs = getAllByPlaceholderText("••••••••");
    fireEvent.changeText(passwordInputs[0], "NewPass1!");
    fireEvent.changeText(passwordInputs[1], "NewPass1!");
    fireEvent.press(getByText("Reset Password"));

    expect(mockAuthClient.resetPassword).not.toHaveBeenCalled();
  });

  it("calls resetPassword with token and new password", async () => {
    mockUseLocalSearchParams.mockReturnValue({ token: "reset-token-123" });
    mockAuthClient.resetPassword.mockResolvedValue({ data: {}, error: null });

    const { getByText, getAllByPlaceholderText } = render(<ResetPassword />);

    const passwordInputs = getAllByPlaceholderText("••••••••");
    fireEvent.changeText(passwordInputs[0], "NewStrongPass1!");
    fireEvent.changeText(passwordInputs[1], "NewStrongPass1!");
    fireEvent.press(getByText("Reset Password"));

    await waitFor(() => {
      expect(mockAuthClient.resetPassword).toHaveBeenCalledWith({
        token: "reset-token-123",
        newPassword: "NewStrongPass1!",
      });
    });
  });

  it("shows success toast after password reset", async () => {
    mockUseLocalSearchParams.mockReturnValue({ token: "reset-token" });
    mockAuthClient.resetPassword.mockResolvedValue({ data: {}, error: null });

    const { getByText, getAllByPlaceholderText } = render(<ResetPassword />);

    const passwordInputs = getAllByPlaceholderText("••••••••");
    fireEvent.changeText(passwordInputs[0], "NewStrongPass1!");
    fireEvent.changeText(passwordInputs[1], "NewStrongPass1!");
    fireEvent.press(getByText("Reset Password"));

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(expect.stringContaining("Password updated"));
    });
  });

  it("shows error on reset failure", async () => {
    mockUseLocalSearchParams.mockReturnValue({ token: "expired-token" });
    mockAuthClient.resetPassword.mockResolvedValue({
      data: null,
      error: { message: "Token has expired" },
    });

    const { getByText, getAllByPlaceholderText } = render(<ResetPassword />);

    const passwordInputs = getAllByPlaceholderText("••••••••");
    fireEvent.changeText(passwordInputs[0], "NewStrongPass1!");
    fireEvent.changeText(passwordInputs[1], "NewStrongPass1!");
    fireEvent.press(getByText("Reset Password"));

    await waitFor(() => {
      expect(getByText("Token has expired")).toBeTruthy();
    });
  });

  it("redirects to sign-in after successful reset", async () => {
    mockUseLocalSearchParams.mockReturnValue({ token: "reset-token" });
    mockAuthClient.resetPassword.mockResolvedValue({ data: {}, error: null });

    const { getByText, getAllByPlaceholderText } = render(<ResetPassword />);

    const passwordInputs = getAllByPlaceholderText("••••••••");
    fireEvent.changeText(passwordInputs[0], "NewStrongPass1!");
    fireEvent.changeText(passwordInputs[1], "NewStrongPass1!");
    fireEvent.press(getByText("Reset Password"));

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/(auth)/sign-in");
    });
  });
});
