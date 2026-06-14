import { WebAppLayout } from "@/components/core/web-app-layout";
import { render } from "@/test/utils";

jest.mock("expo-router", () => ({
  Slot: () => {
    const { Text } = require("react-native");
    return <Text>SlotContent</Text>;
  },
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/components/core/web-content-header", () => {
  const { Text } = require("react-native");
  return { WebContentHeader: () => <Text>Header</Text> };
});

jest.mock("@/components/core/web-sidebar", () => {
  const { Text } = require("react-native");
  return { WebSidebar: () => <Text>Sidebar</Text> };
});

let mockIsMobile = false;

jest.mock("@/hooks/use-web-layout", () => ({
  useWebLayout: () => ({ isMobile: mockIsMobile }),
}));

jest.mock("@/providers/sidebar-provider", () => ({
  useSidebar: () => ({
    sidebarWidth: 240,
    isMobileOpen: false,
    closeMobile: jest.fn(),
    isCollapsed: false,
    toggleCollapsed: jest.fn(),
    openMobile: jest.fn(),
  }),
}));

describe("WebAppLayout", () => {
  it("renders sidebar on desktop", () => {
    mockIsMobile = false;
    const { getByText } = render(<WebAppLayout />);
    expect(getByText("Sidebar")).toBeTruthy();
    expect(getByText("Header")).toBeTruthy();
  });

  it("renders content slot", () => {
    const { getByText } = render(<WebAppLayout />);
    expect(getByText("SlotContent")).toBeTruthy();
  });

  it("hides sidebar on mobile", () => {
    mockIsMobile = true;
    const { getByText } = render(<WebAppLayout />);
    // Header still visible
    expect(getByText("Header")).toBeTruthy();
  });
});
