import { SidebarContent } from "@/components/core/sidebar-content";
import { render } from "@/test/utils";

jest.mock("@/components/ui/app-modal", () => ({
  AppModal: ({ children, visible }: { children: React.ReactNode; visible: boolean }) =>
    visible ? children : null,
}));

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
    user: { name: "Test User" },
    activeMemberRole: "admin",
    activeOrganization: { id: "org1", name: "Org" },
    setActiveOrganization: jest.fn(),
  }),
}));

const mockNavigation = {
  closeDrawer: jest.fn(),
  openDrawer: jest.fn(),
  toggleDrawer: jest.fn(),
  getState: jest.fn(() => ({ routes: [], index: 0 })),
  dispatch: jest.fn(),
  navigate: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
  isFocused: jest.fn(),
  canGoBack: jest.fn(),
  getParent: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  getId: jest.fn(),
  setParams: jest.fn(),
};

const mockDescriptors = {};
const mockState = {
  routes: [],
  index: 0,
  key: "root",
  stale: false,
  type: "drawer" as const,
  routeNames: [],
};

describe("SidebarContent", () => {
  it("renders user name", () => {
    const { getByText } = render(
      <SidebarContent
        navigation={mockNavigation as never}
        descriptors={mockDescriptors as never}
        state={mockState as never}
      />,
    );
    expect(getByText("Test User")).toBeTruthy();
  });

  it("renders nav items", () => {
    const { getByText } = render(
      <SidebarContent
        navigation={mockNavigation as never}
        descriptors={mockDescriptors as never}
        state={mockState as never}
      />,
    );
    expect(getByText("Home")).toBeTruthy();
    expect(getByText("Settings")).toBeTruthy();
  });
});
