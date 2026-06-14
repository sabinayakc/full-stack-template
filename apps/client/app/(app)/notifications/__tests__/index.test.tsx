import NotificationsScreen from "@/app/(app)/notifications/index";
import { render } from "@/test/utils";

jest.mock("@/hooks/use-notification-api", () => ({
  useMyNotifications: () => ({
    data: {
      pages: [
        {
          notifications: [
            {
              id: "n1",
              subject: "New estimate accepted",
              body: "Estimate #5 was accepted by John",
              type: "estimate_accepted",
              read: false,
              createdAt: "2026-04-27T10:00:00Z",
              metadata: {},
            },
          ],
        },
      ],
    },
    isLoading: false,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    refetch: jest.fn(),
  }),
  useUnreadCount: () => ({ data: { count: 1 } }),
  useMarkNotificationRead: () => ({ mutate: jest.fn() }),
  useMarkAllRead: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock("@/lib/formatters", () => ({
  formatRelativeDate: () => "Just now",
  getDateGroup: () => "Today",
}));

describe("NotificationsScreen", () => {
  it("renders notifications title", () => {
    const { getByText } = render(<NotificationsScreen />);
    expect(getByText("Notifications")).toBeTruthy();
  });

  it("renders notification subject", () => {
    const { getByText } = render(<NotificationsScreen />);
    expect(getByText("New estimate accepted")).toBeTruthy();
  });
});
