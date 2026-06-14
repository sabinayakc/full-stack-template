import { useLocalSearchParams } from "expo-router";
import { mockAuthClient } from "@/test/mocks/auth";
import { render, waitFor } from "@/test/utils";
import VerifyEmail from "../verify-email";

const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

describe("VerifyEmail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state while verifying", () => {
    mockUseLocalSearchParams.mockReturnValue({ token: "valid-token" });
    mockAuthClient.verifyEmail.mockReturnValue(new Promise(() => {})); // never resolves

    const { getByText } = render(<VerifyEmail />);

    expect(getByText("Verifying your email address...")).toBeTruthy();
  });

  it("calls verifyEmail with the token from search params", async () => {
    mockUseLocalSearchParams.mockReturnValue({ token: "test-token-123" });
    mockAuthClient.verifyEmail.mockResolvedValue({ data: {}, error: null });

    render(<VerifyEmail />);

    await waitFor(() => {
      expect(mockAuthClient.verifyEmail).toHaveBeenCalledWith({
        query: { token: "test-token-123" },
      });
    });
  });

  it("shows success message when verification succeeds", async () => {
    mockUseLocalSearchParams.mockReturnValue({ token: "valid-token" });
    mockAuthClient.verifyEmail.mockResolvedValue({ data: {}, error: null });

    const { getByText } = render(<VerifyEmail />);

    await waitFor(() => {
      expect(getByText("Your email has been verified. You can now sign in.")).toBeTruthy();
    });
  });

  it("shows waiting state when token is missing", () => {
    mockUseLocalSearchParams.mockReturnValue({});

    const { getByText } = render(<VerifyEmail />);

    expect(getByText("Check your inbox")).toBeTruthy();
    expect(mockAuthClient.verifyEmail).not.toHaveBeenCalled();
  });

  it("shows error when verification fails", async () => {
    mockUseLocalSearchParams.mockReturnValue({ token: "expired-token" });
    mockAuthClient.verifyEmail.mockResolvedValue({
      data: null,
      error: { message: "Token expired" },
    });

    const { getByText } = render(<VerifyEmail />);

    await waitFor(() => {
      expect(getByText("Token expired")).toBeTruthy();
    });
  });

  it("shows generic error when verification throws", async () => {
    mockUseLocalSearchParams.mockReturnValue({ token: "bad-token" });
    mockAuthClient.verifyEmail.mockRejectedValue(new Error("Network error"));

    const { getByText } = render(<VerifyEmail />);

    await waitFor(() => {
      expect(getByText("Could not verify your email.")).toBeTruthy();
    });
  });

  it("shows a Go To Sign In button on success", async () => {
    mockUseLocalSearchParams.mockReturnValue({ token: "valid-token" });
    mockAuthClient.verifyEmail.mockResolvedValue({ data: {}, error: null });

    const { getByText } = render(<VerifyEmail />);

    await waitFor(() => {
      expect(getByText("Go To Sign In")).toBeTruthy();
    });
  });
});
