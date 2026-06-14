import { waitFor } from "@testing-library/react-native";
import MembersScreen from "@/app/(app)/settings/organization/members";
import { render } from "@/test/utils";

jest.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { id: "u1", name: "Jane", email: "jane@test.com" },
    activeOrganization: {
      id: "org1",
      name: "Acme Roofing",
      slug: "acme-roofing",
    },
  }),
}));

jest.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn(), warning: jest.fn() }),
}));

jest.mock("@/lib/auth", () => ({
  authClient: {
    organization: {
      listMembers: jest.fn().mockResolvedValue({
        data: {
          members: [
            {
              id: "m1",
              userId: "u1",
              role: "owner",
              user: { id: "u1", name: "Jane", email: "jane@test.com" },
            },
          ],
          total: 1,
        },
      }),
      listInvitations: jest.fn().mockResolvedValue({ data: [] }),
      inviteMember: jest.fn().mockResolvedValue({}),
      cancelInvitation: jest.fn().mockResolvedValue({}),
      removeMember: jest.fn().mockResolvedValue({}),
      updateMemberRole: jest.fn().mockResolvedValue({}),
    },
  },
}));

jest.mock("@/components/ui/confirm-dialog", () => ({
  confirm: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/components/ui/keyboard-view", () => {
  const React = require("react");
  const { View } = require("react-native");
  return { KeyboardView: ({ children }: { children: React.ReactNode }) => <View>{children}</View> };
});

describe("MembersScreen", () => {
  it("renders Members section", () => {
    const { getByText } = render(<MembersScreen />);
    expect(getByText(/Members/)).toBeTruthy();
  });

  it("renders member name after loading", async () => {
    const { getByText } = render(<MembersScreen />);
    await waitFor(() => {
      expect(getByText("Jane (You)")).toBeTruthy();
    });
  });

  it("renders Invite Members section after role loads", async () => {
    const { getByText } = render(<MembersScreen />);
    await waitFor(() => {
      expect(getByText("Send Invitation")).toBeTruthy();
    });
  });
});
