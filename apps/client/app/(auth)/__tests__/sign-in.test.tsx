import { mockAuthClient, mockSignIn } from "@/test/mocks/auth";
import { fireEvent, render, waitFor } from "@/test/utils";
import SignIn from "../sign-in";

describe("SignIn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders email and password fields", () => {
    const { getByText } = render(<SignIn />);

    expect(getByText("Email")).toBeTruthy();
    expect(getByText("Password")).toBeTruthy();
    expect(getByText("Sign In")).toBeTruthy();
  });

  it("shows validation errors for empty fields", async () => {
    const { getByText } = render(<SignIn />);

    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(getByText("Email is required")).toBeTruthy();
      expect(getByText("Password is required")).toBeTruthy();
    });
  });

  it("shows validation error for invalid email", async () => {
    const { getByText, getByPlaceholderText } = render(<SignIn />);

    fireEvent.changeText(getByPlaceholderText("you@example.com"), "not-an-email");
    fireEvent.changeText(getByPlaceholderText("••••••••"), "password123");
    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(getByText("Enter a valid email")).toBeTruthy();
    });
  });

  it("calls signIn.email with form values on submit", async () => {
    mockSignIn.email.mockResolvedValue({ data: {}, error: null });

    const { getByText, getByPlaceholderText } = render(<SignIn />);

    fireEvent.changeText(getByPlaceholderText("you@example.com"), "user@test.com");
    fireEvent.changeText(getByPlaceholderText("••••••••"), "Password1!");
    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(mockSignIn.email).toHaveBeenCalledWith({
        email: "user@test.com",
        password: "Password1!",
      });
    });
  });

  it("shows error message on sign-in failure", async () => {
    mockSignIn.email.mockResolvedValue({
      data: null,
      error: { message: "Invalid credentials", status: 401 },
    });

    const { getByText, getByPlaceholderText } = render(<SignIn />);

    fireEvent.changeText(getByPlaceholderText("you@example.com"), "user@test.com");
    fireEvent.changeText(getByPlaceholderText("••••••••"), "WrongPass1!");
    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(getByText("Invalid credentials")).toBeTruthy();
    });
  });

  it("shows verification card when email is not verified", async () => {
    mockSignIn.email.mockResolvedValue({
      data: null,
      error: { message: "Please verify your email", status: 403 },
    });

    const { getByText, getByPlaceholderText } = render(<SignIn />);

    fireEvent.changeText(getByPlaceholderText("you@example.com"), "user@test.com");
    fireEvent.changeText(getByPlaceholderText("••••••••"), "Password1!");
    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(
        getByText("Please verify your email address. We sent you a new verification link."),
      ).toBeTruthy();
    });
  });

  it("sends verification email on resend", async () => {
    mockSignIn.email.mockResolvedValue({
      data: null,
      error: { message: "Verify your email", status: 403 },
    });
    mockAuthClient.sendVerificationEmail.mockResolvedValue({ data: {}, error: null });

    const { getByText, getByPlaceholderText, findByText } = render(<SignIn />);

    fireEvent.changeText(getByPlaceholderText("you@example.com"), "user@test.com");
    fireEvent.changeText(getByPlaceholderText("••••••••"), "Password1!");
    fireEvent.press(getByText("Sign In"));

    const resendButton = await findByText("Resend Email");
    expect(resendButton).toBeTruthy();
  });

  it("has a forgot password link", () => {
    const { getByText } = render(<SignIn />);

    expect(getByText("Forgot password?")).toBeTruthy();
  });
});
