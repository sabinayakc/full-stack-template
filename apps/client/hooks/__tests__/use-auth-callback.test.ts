import { renderHook } from "@testing-library/react-native";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useAuthCallback } from "../use-auth-callback";

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

describe("useAuthCallback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("checks for initial URL on mount", () => {
    renderHook(() => useAuthCallback());

    expect(Linking.getInitialURL).toHaveBeenCalled();
  });

  it("registers a URL event listener", () => {
    renderHook(() => useAuthCallback());

    expect(Linking.addEventListener).toHaveBeenCalledWith("url", expect.any(Function));
  });

  it("cleans up the event listener on unmount", () => {
    const mockRemove = jest.fn();
    (Linking.addEventListener as jest.Mock).mockReturnValue({ remove: mockRemove });

    const { unmount } = renderHook(() => useAuthCallback());
    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });

  it("navigates to verify-email for verify-email URLs", async () => {
    (Linking.getInitialURL as jest.Mock).mockResolvedValue(
      "https://app.example.com/verify-email?token=abc123",
    );
    (Linking.parse as jest.Mock).mockReturnValue({
      path: "/verify-email",
      queryParams: { token: "abc123" },
    });

    renderHook(() => useAuthCallback());

    // Wait for the async getInitialURL to resolve
    await new Promise((r) => setTimeout(r, 0));

    expect(router.replace).toHaveBeenCalledWith({
      pathname: "/(auth)/verify-email",
      params: { token: "abc123" },
    });
  });

  it("navigates to reset-password for reset-password URLs", async () => {
    (Linking.getInitialURL as jest.Mock).mockResolvedValue(
      "https://app.example.com/reset-password?token=xyz789",
    );
    (Linking.parse as jest.Mock).mockReturnValue({
      path: "/reset-password",
      queryParams: { token: "xyz789" },
    });

    renderHook(() => useAuthCallback());

    await new Promise((r) => setTimeout(r, 0));

    expect(router.replace).toHaveBeenCalledWith({
      pathname: "/(auth)/reset-password",
      params: { token: "xyz789" },
    });
  });

  it("ignores URLs that are not auth-related", async () => {
    (Linking.getInitialURL as jest.Mock).mockResolvedValue("https://app.example.com/dashboard");
    (Linking.parse as jest.Mock).mockReturnValue({
      path: "/dashboard",
      queryParams: {},
    });

    renderHook(() => useAuthCallback());

    await new Promise((r) => setTimeout(r, 0));

    expect(router.replace).not.toHaveBeenCalled();
  });

  it("handles warm-start URL events", () => {
    let urlHandler: (event: { url: string }) => void;
    (Linking.addEventListener as jest.Mock).mockImplementation((_event, handler) => {
      urlHandler = handler;
      return { remove: jest.fn() };
    });
    (Linking.parse as jest.Mock).mockReturnValue({
      path: "/verify-email",
      queryParams: { token: "warm-token" },
    });

    renderHook(() => useAuthCallback());

    urlHandler!({ url: "https://app.example.com/verify-email?token=warm-token" });

    expect(router.replace).toHaveBeenCalledWith({
      pathname: "/(auth)/verify-email",
      params: { token: "warm-token" },
    });
  });

  it("does nothing when initial URL is null", async () => {
    (Linking.getInitialURL as jest.Mock).mockResolvedValue(null);

    renderHook(() => useAuthCallback());

    await new Promise((r) => setTimeout(r, 0));

    expect(router.replace).not.toHaveBeenCalled();
  });
});
