import ProfileScreen from "@/app/(app)/settings/account/profile";
import { render } from "@/test/utils";

jest.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: {
      name: "Jane Doe",
      email: "jane@test.com",
      emailVerified: true,
      role: "admin",
      metadata: { jobTitle: "Estimator", aiTone: "professional" },
    },
  }),
}));

jest.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn(), warning: jest.fn() }),
}));

jest.mock("@/hooks/use-avatar-url", () => ({
  useAvatarUrl: () => ({ avatarUrl: null, invalidate: jest.fn() }),
}));

jest.mock("@/lib/api", () => ({
  fetchWithAuth: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  authClient: {
    updateUser: jest.fn().mockResolvedValue({}),
    changeEmail: jest.fn().mockResolvedValue({}),
    sendVerificationEmail: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock("@/components/ui/avatar-editor", () => {
  const { View } = require("react-native");
  return { AvatarEditor: () => <View /> };
});

describe("ProfileScreen", () => {
  it("renders Profile section", () => {
    const { getByText } = render(<ProfileScreen />);
    expect(getByText("Profile")).toBeTruthy();
  });

  it("renders user name", () => {
    const { getByText } = render(<ProfileScreen />);
    expect(getByText("Jane Doe")).toBeTruthy();
  });

  it("renders Preferences section", () => {
    const { getByText } = render(<ProfileScreen />);
    expect(getByText("Preferences")).toBeTruthy();
  });

  it("renders verified badge", () => {
    const { getByText } = render(<ProfileScreen />);
    expect(getByText("Verified")).toBeTruthy();
  });
});
