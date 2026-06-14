import { mockAuthClient } from "@/test/mocks/auth";
import { fireEvent, render, waitFor } from "@/test/utils";
import ForgotPassword from "../forgot-password";

describe("ForgotPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders email field and submit button", () => {
    const { getByText, getByPlaceholderText } = render(<ForgotPassword />);

    expect(getByText("Email")).toBeTruthy();
    expect(getByPlaceholderText("you@example.com")).toBeTruthy();
    expect(getByText("Send Reset Link")).toBeTruthy();
  });

  it("shows validation error for empty email", async () => {
    const { getByText } = render(<ForgotPassword />);

    fireEvent.press(getByText("Send Reset Link"));

    await waitFor(() => {
      expect(getByText("Email is required")).toBeTruthy();
    });
  });

  it("shows validation error for invalid email", async () => {
    const { getByText, getByPlaceholderText } = render(<ForgotPassword />);

    fireEvent.changeText(getByPlaceholderText("you@example.com"), "not-an-email");
    fireEvent.press(getByText("Send Reset Link"));

    await waitFor(() => {
      expect(getByText("Enter a valid email")).toBeTruthy();
    });
  });

  it("calls requestPasswordReset with email", async () => {
    mockAuthClient.requestPasswordReset.mockResolvedValue({ data: {}, error: null });

    const { getByText, getByPlaceholderText } = render(<ForgotPassword />);

    fireEvent.changeText(getByPlaceholderText("you@example.com"), "user@test.com");
    fireEvent.press(getByText("Send Reset Link"));

    await waitFor(() => {
      expect(mockAuthClient.requestPasswordReset).toHaveBeenCalledWith({
        email: "user@test.com",
      });
    });
  });

  it("shows success message after requesting reset", async () => {
    mockAuthClient.requestPasswordReset.mockResolvedValue({ data: {}, error: null });

    const { getByText, getByPlaceholderText } = render(<ForgotPassword />);

    fireEvent.changeText(getByPlaceholderText("you@example.com"), "user@test.com");
    fireEvent.press(getByText("Send Reset Link"));

    await waitFor(() => {
      expect(getByText("If an account exists for that email, we sent a reset link.")).toBeTruthy();
    });
  });

  it("shows error message on failure", async () => {
    mockAuthClient.requestPasswordReset.mockResolvedValue({
      data: null,
      error: { message: "Rate limited" },
    });

    const { getByText, getByPlaceholderText } = render(<ForgotPassword />);

    fireEvent.changeText(getByPlaceholderText("you@example.com"), "user@test.com");
    fireEvent.press(getByText("Send Reset Link"));

    await waitFor(() => {
      expect(getByText("Rate limited")).toBeTruthy();
    });
  });
});
