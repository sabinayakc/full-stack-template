import SettingsScreen from "@/app/(app)/settings/index";
import { render } from "@/test/utils";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { name: "Jane Doe", email: "jane@test.com", image: null },
    activeOrganization: { id: "org1", name: "Acme Roofing", metadata: { role: "admin" } },
    logout: jest.fn(),
  }),
}));

jest.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn() }),
}));

jest.mock("@/hooks/use-avatar-url", () => ({
  useAvatarUrl: () => ({ avatarUrl: null }),
}));

jest.mock("@/providers/query-provider", () => ({
  useQueryReset: () => jest.fn(),
}));

jest.mock("@/lib/api", () => ({
  fetchWithAuth: jest.fn().mockResolvedValue({}),
}));

jest.mock("@/lib/auth", () => ({
  authClient: {
    signOut: jest.fn().mockResolvedValue({}),
    deleteUser: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock("@/components/ui/confirm-dialog", () => ({
  confirm: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/providers/appearance-provider", () => ({
  useAppearance: () => ({ mode: "system", setMode: jest.fn() }),
}));

jest.mock("@/lib/preflight", () => ({
  showPreflightBlockers: jest.fn().mockResolvedValue(false),
}));

describe("SettingsScreen", () => {
  it("renders user name", () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText("Jane Doe")).toBeTruthy();
  });

  it("renders user email", () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText("jane@test.com")).toBeTruthy();
  });

  it("renders account section", () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText("Account")).toBeTruthy();
    expect(getByText("Profile")).toBeTruthy();
    expect(getByText("Security")).toBeTruthy();
  });

  it("renders appearance section", () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText("Appearance")).toBeTruthy();
  });

  it("renders sign out button", () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText("Sign Out")).toBeTruthy();
  });
});
