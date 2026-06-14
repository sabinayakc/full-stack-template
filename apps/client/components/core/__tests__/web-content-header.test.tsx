import { WebContentHeader } from "@/components/core/web-content-header";
import { render } from "@/test/utils";

jest.mock("@/components/core/notification-bell", () => {
  const { Text } = require("react-native");
  return { NotificationBell: () => <Text>Bell</Text> };
});

jest.mock("@/hooks/use-web-layout", () => ({
  useWebLayout: () => ({ isMobile: false }),
}));

jest.mock("@/providers/sidebar-provider", () => ({
  useSidebar: () => ({
    toggleCollapsed: jest.fn(),
    openMobile: jest.fn(),
    isCollapsed: false,
  }),
}));

let mockPathname = "/dashboard";
jest.mock("expo-router", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: jest.fn() }),
}));

describe("WebContentHeader", () => {
  it("renders page title from route", () => {
    mockPathname = "/notifications";
    const { getByText } = render(<WebContentHeader />);
    expect(getByText("Notifications")).toBeTruthy();
  });

  it("renders Settings title", () => {
    mockPathname = "/settings";
    const { getByText } = render(<WebContentHeader />);
    expect(getByText("Settings")).toBeTruthy();
  });

  it("renders notification bell", () => {
    const { getByText } = render(<WebContentHeader />);
    expect(getByText("Bell")).toBeTruthy();
  });

  it("renders app name for unknown routes", () => {
    mockPathname = "/unknown-route";
    const { getByText } = render(<WebContentHeader />);
    expect(getByText("App")).toBeTruthy();
  });
});
