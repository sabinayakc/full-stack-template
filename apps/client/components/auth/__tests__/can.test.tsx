import { Text } from "react-native";
import { Can } from "@/components/auth/can";
import { render } from "@/test/utils";

const mockAuth: { activeMemberRole?: string } = { activeMemberRole: "admin" };

jest.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ activeMemberRole: mockAuth.activeMemberRole }),
}));

describe("Can", () => {
  it("renders children when user has permission", () => {
    mockAuth.activeMemberRole = "admin";
    const { getByText } = render(
      <Can resource="settings" action="update">
        <Text>Edit Settings</Text>
      </Can>,
    );
    expect(getByText("Edit Settings")).toBeTruthy();
  });

  it("hides children when user lacks permission", () => {
    mockAuth.activeMemberRole = "member";
    const { queryByText } = render(
      <Can resource="settings" action="update">
        <Text>Edit Settings</Text>
      </Can>,
    );
    expect(queryByText("Edit Settings")).toBeNull();
  });

  it("renders fallback when user lacks permission", () => {
    mockAuth.activeMemberRole = "member";
    const { getByText } = render(
      <Can resource="settings" action="update" fallback={<Text>You don't have permission</Text>}>
        <Text>Edit Settings</Text>
      </Can>,
    );
    expect(getByText("You don't have permission")).toBeTruthy();
  });

  it("hides children when user has no role", () => {
    mockAuth.activeMemberRole = undefined;
    const { queryByText } = render(
      <Can resource="settings" action="read">
        <Text>View</Text>
      </Can>,
    );
    expect(queryByText("View")).toBeNull();
  });
});
