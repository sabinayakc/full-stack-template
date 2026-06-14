import { FilterBar } from "@/components/ui/filter-bar";
import { fireEvent, render } from "@/test/utils";

const FILTERS = ["all", "active", "inactive"] as const;

describe("FilterBar", () => {
  it("renders all filter chips", () => {
    const { getByText } = render(
      <FilterBar filters={FILTERS} activeFilter="all" onFilterChange={jest.fn()} />,
    );
    expect(getByText("all")).toBeTruthy();
    expect(getByText("active")).toBeTruthy();
    expect(getByText("inactive")).toBeTruthy();
  });

  it("calls onFilterChange when a chip is pressed", () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <FilterBar filters={FILTERS} activeFilter="all" onFilterChange={onChange} />,
    );
    fireEvent.press(getByText("active"));
    expect(onChange).toHaveBeenCalledWith("active");
  });

  it("uses renderLabel for custom labels", () => {
    const labels: Record<string, string> = {
      all: "All Items",
      active: "Active",
      inactive: "Inactive",
    };
    const { getByText } = render(
      <FilterBar
        filters={FILTERS}
        activeFilter="all"
        onFilterChange={jest.fn()}
        renderLabel={(f) => labels[f] ?? f}
      />,
    );
    expect(getByText("All Items")).toBeTruthy();
  });
});
