import { useRouter } from "expo-router";
import { mockSignUp } from "@/test/mocks/auth";
import { fireEvent, render, waitFor } from "@/test/utils";
import SignUp from "../sign-up";

const mockRouter = useRouter as jest.Mock;

describe("SignUp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields", () => {
    const { getByText } = render(<SignUp />);

    expect(getByText("Name")).toBeTruthy();
    expect(getByText("Email")).toBeTruthy();
    expect(getByText("Password")).toBeTruthy();
    expect(getByText("Confirm Password")).toBeTruthy();
    expect(getByText("Create Account")).toBeTruthy();
  });

  it("shows validation errors for empty fields", async () => {
    const { getByText } = render(<SignUp />);

    fireEvent.press(getByText("Create Account"));

    await waitFor(() => {
      expect(getByText("Name must be at least 2 characters")).toBeTruthy();
      expect(getByText("Email is required")).toBeTruthy();
    });
  });

  it("calls signUp.email with form values", async () => {
    mockSignUp.email.mockResolvedValue({ data: {}, error: null });

    const { getByText, getByPlaceholderText, getAllByPlaceholderText } = render(<SignUp />);

    fireEvent.changeText(getByPlaceholderText("John Doe"), "Test User");
    fireEvent.changeText(getByPlaceholderText("you@example.com"), "user@test.com");

    const passwordInputs = getAllByPlaceholderText("••••••••");
    fireEvent.changeText(passwordInputs[0], "StrongPass1!");
    fireEvent.changeText(passwordInputs[1], "StrongPass1!");

    fireEvent.press(getByText("Create Account"));

    await waitFor(() => {
      expect(mockSignUp.email).toHaveBeenCalledWith({
        name: "Test User",
        email: "user@test.com",
        password: "StrongPass1!",
      });
    });
  });

  it("navigates to verify-email page after successful sign-up", async () => {
    const mockReplace = jest.fn();
    mockRouter.mockReturnValue({ replace: mockReplace, push: jest.fn(), back: jest.fn() });
    mockSignUp.email.mockResolvedValue({ data: { user: { id: "1" } }, error: null });

    const { getByText, getByPlaceholderText, getAllByPlaceholderText } = render(<SignUp />);

    fireEvent.changeText(getByPlaceholderText("John Doe"), "Test User");
    fireEvent.changeText(getByPlaceholderText("you@example.com"), "user@test.com");

    const passwordInputs = getAllByPlaceholderText("••••••••");
    fireEvent.changeText(passwordInputs[0], "StrongPass1!");
    fireEvent.changeText(passwordInputs[1], "StrongPass1!");

    fireEvent.press(getByText("Create Account"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/verify-email?email=user%40test.com");
    });
  });

  it("shows error message on sign-up failure", async () => {
    mockSignUp.email.mockResolvedValue({
      data: null,
      error: { message: "Email already in use" },
    });

    const { getByText, getByPlaceholderText, getAllByPlaceholderText } = render(<SignUp />);

    fireEvent.changeText(getByPlaceholderText("John Doe"), "Test User");
    fireEvent.changeText(getByPlaceholderText("you@example.com"), "existing@test.com");

    const passwordInputs = getAllByPlaceholderText("••••••••");
    fireEvent.changeText(passwordInputs[0], "StrongPass1!");
    fireEvent.changeText(passwordInputs[1], "StrongPass1!");

    fireEvent.press(getByText("Create Account"));

    await waitFor(() => {
      expect(getByText("Email already in use")).toBeTruthy();
    });
  });
});
