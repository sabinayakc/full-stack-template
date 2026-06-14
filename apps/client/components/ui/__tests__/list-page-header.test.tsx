import { createRef } from "react";
import type { TextInput } from "react-native";
import { ListPageHeader } from "@/components/ui/list-page-header";
import { fireEvent, render } from "@/test/utils";

describe("ListPageHeader", () => {
  const baseProps = {
    sectionLabel: "CUSTOMERS",
    title: "All Customers",
    subtitle: "Manage your customer list",
    stats: [
      { label: "Total", value: 42 },
      { label: "Active", value: 30 },
    ] as [{ label: string; value: number }, { label: string; value: number }],
    searchPlaceholder: "Search customers...",
    testIDPrefix: "customers",
    isSearching: false,
    searchQuery: "",
    onSearchQueryChange: jest.fn(),
    onSearchToggle: jest.fn(),
    searchInputRef: createRef<TextInput | null>(),
    animatedStyles: {
      animatedCardStyle: {},
      animatedTitleStyle: {},
      animatedSubtitleStyle: {},
      animatedStatsStyle: {},
      isHeaderCompact: false,
    } as any,
  };

  it("renders section label and title", () => {
    const { getByText } = render(<ListPageHeader {...baseProps} />);
    expect(getByText("CUSTOMERS")).toBeTruthy();
    expect(getByText("All Customers")).toBeTruthy();
  });

  it("renders subtitle", () => {
    const { getByText } = render(<ListPageHeader {...baseProps} />);
    expect(getByText("Manage your customer list")).toBeTruthy();
  });

  it("renders stats", () => {
    const { getByText } = render(<ListPageHeader {...baseProps} />);
    expect(getByText("Total")).toBeTruthy();
    expect(getByText("42")).toBeTruthy();
    expect(getByText("Active")).toBeTruthy();
    expect(getByText("30")).toBeTruthy();
  });

  it("renders search toggle", () => {
    const { getByTestId } = render(<ListPageHeader {...baseProps} />);
    expect(getByTestId("customers-search-toggle")).toBeTruthy();
  });

  it("calls onSearchToggle when search button pressed", () => {
    const onSearchToggle = jest.fn();
    const { getByTestId } = render(
      <ListPageHeader {...baseProps} onSearchToggle={onSearchToggle} />,
    );
    fireEvent.press(getByTestId("customers-search-toggle"));
    expect(onSearchToggle).toHaveBeenCalledTimes(1);
  });

  it("renders search input when isSearching", () => {
    const { getByTestId } = render(<ListPageHeader {...baseProps} isSearching={true} />);
    expect(getByTestId("customers-search-input")).toBeTruthy();
  });
});
