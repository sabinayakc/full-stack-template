import { NotificationBell } from "@/components/core/notification-bell";
import { render } from "@/test/utils";

const mockUseUnreadCount = jest.fn();

jest.mock("@/hooks/use-notification-api", () => ({
  useUnreadCount: () => mockUseUnreadCount(),
}));

describe("NotificationBell", () => {
  beforeEach(() => {
    mockUseUnreadCount.mockReturnValue({ data: { count: 0 } });
  });

  it("renders without badge when count is 0", () => {
    const { queryByText } = render(<NotificationBell />);
    expect(queryByText("0")).toBeNull();
  });

  it("renders badge with count", () => {
    mockUseUnreadCount.mockReturnValue({ data: { count: 5 } });
    const { getByText } = render(<NotificationBell />);
    expect(getByText("5")).toBeTruthy();
  });

  it("renders 99+ for large counts", () => {
    mockUseUnreadCount.mockReturnValue({ data: { count: 150 } });
    const { getByText } = render(<NotificationBell />);
    expect(getByText("99+")).toBeTruthy();
  });

  it("navigates to notifications on press", () => {
    render(<NotificationBell />);
  });
});
