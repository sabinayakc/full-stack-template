import NotificationsScreen from "@/app/(app)/settings/notifications/index";
import { render } from "@/test/utils";

jest.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: {
      email: "test@test.com",
      metadata: { notificationPreferences: {} },
    },
  }),
}));

jest.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn() }),
}));

jest.mock("@/hooks/use-notification-permission", () => ({
  useNotificationPermission: () => ({
    permission: "granted",
    request: jest.fn(),
  }),
}));

jest.mock("@/providers/push-provider", () => ({
  usePush: () => ({
    registerToken: jest.fn(),
  }),
}));

jest.mock("@/lib/auth", () => ({
  authClient: {
    updateUser: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock("@/components/ui/confirm-dialog", () => ({
  confirm: jest.fn().mockResolvedValue(true),
}));

describe("NotificationsScreen", () => {
  it("renders channels section", () => {
    const { getByText } = render(<NotificationsScreen />);
    expect(getByText("Channels")).toBeTruthy();
  });

  it("renders push notification toggle", () => {
    const { getByText } = render(<NotificationsScreen />);
    expect(getByText("Push Notifications")).toBeTruthy();
  });

  it("renders email toggle", () => {
    const { getByText } = render(<NotificationsScreen />);
    expect(getByText("Email Notifications")).toBeTruthy();
  });

  it("renders categories section", () => {
    const { getByText } = render(<NotificationsScreen />);
    expect(getByText("Categories")).toBeTruthy();
  });
});
