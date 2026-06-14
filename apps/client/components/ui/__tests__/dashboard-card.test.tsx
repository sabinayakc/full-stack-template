import { Text } from "react-native";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { render } from "@/test/utils";

describe("DashboardCard", () => {
  it("renders section label, title, and children", () => {
    const { getByText } = render(
      <DashboardCard sectionLabel="Overview" title="Dashboard">
        <Text>Card content</Text>
      </DashboardCard>,
    );
    expect(getByText("Overview")).toBeTruthy();
    expect(getByText("Dashboard")).toBeTruthy();
    expect(getByText("Card content")).toBeTruthy();
  });

  it("renders subtitle when provided", () => {
    const { getByText } = render(
      <DashboardCard sectionLabel="Stats" title="Revenue" subtitle="Last 30 days" />,
    );
    expect(getByText("Last 30 days")).toBeTruthy();
  });

  it("does not render subtitle when not provided", () => {
    const { queryByText } = render(<DashboardCard sectionLabel="Stats" title="Revenue" />);
    expect(queryByText("Last 30 days")).toBeNull();
  });

  it("applies testID", () => {
    const { getByTestId } = render(<DashboardCard sectionLabel="X" title="Y" testID="my-card" />);
    expect(getByTestId("my-card")).toBeTruthy();
  });

  it("renders headerRight content", () => {
    const { getByText } = render(
      <DashboardCard sectionLabel="X" title="Y" headerRight={<Text>Action</Text>} />,
    );
    expect(getByText("Action")).toBeTruthy();
  });
});
