import { fireEvent, waitFor } from "@testing-library/react-native";
import SessionsScreen from "@/app/(app)/settings/account/sessions";
import { render } from "@/test/utils";

const mockConfirm = jest.fn().mockResolvedValue(true);
jest.mock("@/components/ui/confirm-dialog", () => ({
  confirm: (...args: unknown[]) => mockConfirm(...args),
}));

const mockListSessions = jest.fn();
const mockRevokeSession = jest.fn();
const mockRevokeOtherSessions = jest.fn();
const mockUseSession = jest.fn();

jest.mock("@/lib/auth", () => ({
  authClient: {
    listSessions: (...args: unknown[]) => mockListSessions(...args),
    revokeSession: (...args: unknown[]) => mockRevokeSession(...args),
    revokeOtherSessions: (...args: unknown[]) => mockRevokeOtherSessions(...args),
  },
  useSession: () => mockUseSession(),
}));

jest.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn() }),
}));

const CURRENT_TOKEN = "current-session-token";

const mockSessions = [
  {
    id: "session-1",
    token: CURRENT_TOKEN,
    createdAt: new Date("2026-04-28T10:00:00Z"),
    updatedAt: new Date("2026-05-01T09:00:00Z"),
    expiresAt: new Date("2026-05-08T10:00:00Z"),
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    ipAddress: "192.168.1.10",
  },
  {
    id: "session-2",
    token: "other-session-token",
    createdAt: new Date("2026-04-25T08:00:00Z"),
    updatedAt: new Date("2026-04-30T14:00:00Z"),
    expiresAt: new Date("2026-05-07T08:00:00Z"),
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0",
    ipAddress: "10.0.0.5",
  },
];

describe("SessionsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: { session: { token: CURRENT_TOKEN } },
    });
    mockListSessions.mockResolvedValue({ data: mockSessions });
    mockRevokeSession.mockResolvedValue({});
    mockRevokeOtherSessions.mockResolvedValue({});
  });

  it("shows loading indicator while fetching", () => {
    mockListSessions.mockReturnValue(new Promise(() => {}));
    const { getByTestId } = render(<SessionsScreen />);
    expect(getByTestId("sessions-loading")).toBeTruthy();
  });

  it("renders current session with Current badge", async () => {
    const { getByTestId, getByText } = render(<SessionsScreen />);
    await waitFor(() => {
      expect(getByTestId("current-session")).toBeTruthy();
    });
    expect(getByText("Current")).toBeTruthy();
    expect(getByText("iPhone")).toBeTruthy();
  });

  it("renders other sessions", async () => {
    const { getAllByTestId } = render(<SessionsScreen />);
    await waitFor(() => {
      expect(getAllByTestId("other-session")).toHaveLength(1);
    });
  });

  it("does not show revoke button on current session", async () => {
    const { queryByTestId } = render(<SessionsScreen />);
    await waitFor(() => {
      expect(queryByTestId("revoke-btn-session-1")).toBeNull();
    });
  });

  it("shows revoke button on other sessions", async () => {
    const { getByTestId } = render(<SessionsScreen />);
    await waitFor(() => {
      expect(getByTestId("revoke-btn-session-2")).toBeTruthy();
    });
  });

  it("confirms before revoking a session", async () => {
    const { getByTestId } = render(<SessionsScreen />);
    await waitFor(() => {
      expect(getByTestId("revoke-btn-session-2")).toBeTruthy();
    });
    fireEvent.press(getByTestId("revoke-btn-session-2"));
    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Revoke Session",
          variant: "danger",
        }),
      );
    });
  });

  it("calls revokeSession after confirmation", async () => {
    mockConfirm.mockResolvedValue(true);
    const { getByTestId } = render(<SessionsScreen />);
    await waitFor(() => {
      expect(getByTestId("revoke-btn-session-2")).toBeTruthy();
    });
    fireEvent.press(getByTestId("revoke-btn-session-2"));
    await waitFor(() => {
      expect(mockRevokeSession).toHaveBeenCalledWith({ token: "other-session-token" });
    });
  });

  it("does not revoke if confirmation is cancelled", async () => {
    mockConfirm.mockResolvedValue(false);
    const { getByTestId } = render(<SessionsScreen />);
    await waitFor(() => {
      expect(getByTestId("revoke-btn-session-2")).toBeTruthy();
    });
    fireEvent.press(getByTestId("revoke-btn-session-2"));
    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
    });
    expect(mockRevokeSession).not.toHaveBeenCalled();
  });

  it("shows Revoke All button when other sessions exist", async () => {
    const { getByTestId } = render(<SessionsScreen />);
    await waitFor(() => {
      expect(getByTestId("revoke-all-btn")).toBeTruthy();
    });
  });

  it("confirms before revoking all other sessions", async () => {
    const { getByTestId } = render(<SessionsScreen />);
    await waitFor(() => {
      expect(getByTestId("revoke-all-btn")).toBeTruthy();
    });
    fireEvent.press(getByTestId("revoke-all-btn"));
    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Revoke All Other Sessions",
          variant: "danger",
        }),
      );
    });
  });

  it("calls revokeOtherSessions after revoke all confirmation", async () => {
    mockConfirm.mockResolvedValue(true);
    const { getByTestId } = render(<SessionsScreen />);
    await waitFor(() => {
      expect(getByTestId("revoke-all-btn")).toBeTruthy();
    });
    fireEvent.press(getByTestId("revoke-all-btn"));
    await waitFor(() => {
      expect(mockRevokeOtherSessions).toHaveBeenCalled();
    });
  });

  it("hides Revoke All when only current session exists", async () => {
    mockListSessions.mockResolvedValue({ data: [mockSessions[0]] });
    const { queryByTestId } = render(<SessionsScreen />);
    await waitFor(() => {
      expect(queryByTestId("current-session")).toBeTruthy();
    });
    expect(queryByTestId("revoke-all-btn")).toBeNull();
  });

  it("parses device info from userAgent", async () => {
    const { getByText } = render(<SessionsScreen />);
    await waitFor(() => {
      expect(getByText("iPhone")).toBeTruthy();
      expect(getByText("Mac")).toBeTruthy();
    });
  });

  it("parses native App user-agent format", async () => {
    mockListSessions.mockResolvedValue({
      data: [
        {
          ...mockSessions[0],
          userAgent: "App/1.0.0 (iOS 17.5; iPhone 15 Pro; Mobile)",
        },
      ],
    });
    const { getByText } = render(<SessionsScreen />);
    await waitFor(() => {
      expect(getByText("iPhone 15 Pro (iOS)")).toBeTruthy();
      expect(getByText("App App")).toBeTruthy();
    });
  });

  it("shows IP addresses", async () => {
    const { getByText } = render(<SessionsScreen />);
    await waitFor(() => {
      expect(getByText("IP: 192.168.1.10")).toBeTruthy();
      expect(getByText("IP: 10.0.0.5")).toBeTruthy();
    });
  });
});
