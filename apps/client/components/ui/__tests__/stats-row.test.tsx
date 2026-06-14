import { StatsRow } from "@/components/ui/stats-row";
import { render } from "@/test/utils";

describe("StatsRow", () => {
  it("renders all stat labels and values", () => {
    const stats = [
      { label: "Revenue", value: "$12,000" },
      { label: "Jobs", value: 42 },
    ];
    const { getByText } = render(<StatsRow stats={stats} />);
    expect(getByText("Revenue")).toBeTruthy();
    expect(getByText("$12,000")).toBeTruthy();
    expect(getByText("Jobs")).toBeTruthy();
    expect(getByText("42")).toBeTruthy();
  });

  it("renders primary variant", () => {
    const stats = [{ label: "Active", value: 5, variant: "primary" as const }];
    const { getByText } = render(<StatsRow stats={stats} />);
    expect(getByText("Active")).toBeTruthy();
    expect(getByText("5")).toBeTruthy();
  });
});
