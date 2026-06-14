import { ChipSelector } from "@/components/ui/chip-selector";
import { fireEvent, render } from "@/test/utils";

const ITEMS = ["low", "medium", "high"] as const;

describe("ChipSelector (single)", () => {
  it("renders all items", () => {
    const { getByText } = render(
      <ChipSelector items={ITEMS} selectedValue="low" onSelect={jest.fn()} />,
    );
    expect(getByText("low")).toBeTruthy();
    expect(getByText("medium")).toBeTruthy();
    expect(getByText("high")).toBeTruthy();
  });

  it("calls onSelect when a chip is pressed", () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <ChipSelector items={ITEMS} selectedValue="low" onSelect={onSelect} />,
    );
    fireEvent.press(getByText("high"));
    expect(onSelect).toHaveBeenCalledWith("high");
  });

  it("uses renderLabel for custom labels", () => {
    const labels: Record<string, string> = { low: "Low", medium: "Med", high: "High" };
    const { getByText } = render(
      <ChipSelector
        items={ITEMS}
        selectedValue="low"
        onSelect={jest.fn()}
        renderLabel={(item) => labels[item] ?? item}
      />,
    );
    expect(getByText("Med")).toBeTruthy();
  });

  it("applies testID prefix", () => {
    const { getByTestId } = render(
      <ChipSelector items={ITEMS} selectedValue="low" onSelect={jest.fn()} testIDPrefix="pri" />,
    );
    expect(getByTestId("pri-low")).toBeTruthy();
    expect(getByTestId("pri-high")).toBeTruthy();
  });
});

describe("ChipSelector (multi)", () => {
  it("calls onToggle when a chip is pressed", () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <ChipSelector multi items={ITEMS} selectedValues={["low"]} onToggle={onToggle} />,
    );
    fireEvent.press(getByText("medium"));
    expect(onToggle).toHaveBeenCalledWith("medium");
  });
});
