import { WebSidebar } from "@/components/core/web-sidebar";
import { render } from "@/test/utils";

jest.mock("@/components/core/org-selector", () => {
  const { Text } = require("react-native");
  return { OrgSelector: () => <Text>OrgSelector</Text> };
});

jest.mock("@/hooks/use-avatar-url", () => ({
  useAvatarUrl: () => ({ avatarUrl: null }),
}));

jest.mock("@/hooks/use-permission", () => ({
  usePermission: () => ({ can: () => true }),
}));

jest.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { name: "Jane Doe" },
    activeMemberRole: "admin",
  }),
}));

let mockCollapsed = false;

jest.mock("@/providers/sidebar-provider", () => ({
  SIDEBAR_WIDTH_COLLAPSED: 64,
  SIDEBAR_WIDTH_EXPANDED: 240,
  useSidebar: () => ({
    isCollapsed: mockCollapsed,
    toggleCollapsed: jest.fn(),
  }),
}));

describe("WebSidebar", () => {
  beforeEach(() => {
    mockCollapsed = false;
  });

  it("renders nav items when expanded", () => {
    const { getByText } = render(<WebSidebar />);
    expect(getByText("Home")).toBeTruthy();
    expect(getByText("Settings")).toBeTruthy();
  });

  it("renders user name", () => {
    const { getByText } = render(<WebSidebar />);
    expect(getByText("Jane Doe")).toBeTruthy();
  });
});
