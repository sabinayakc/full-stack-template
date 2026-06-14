import { Text } from "react-native";
import { ListScaffold } from "@/components/ui/list-scaffold";
import { render } from "@/test/utils";

describe("ListScaffold", () => {
  const baseProps = {
    isLoading: false,
    isEmpty: false,
    emptyIcon: "tray",
    emptyTitle: "No Items",
    emptySubtitle: "Nothing here yet.",
    isRefetching: false,
    onRefresh: jest.fn(),
    onScroll: jest.fn(),
    isFetchingNextPage: false,
  };

  it("shows loading indicator when isLoading", () => {
    const { toJSON } = render(
      <ListScaffold {...baseProps} isLoading={true}>
        <Text>Content</Text>
      </ListScaffold>,
    );
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain("ActivityIndicator");
  });

  it("shows empty state when isEmpty", () => {
    const { getByText } = render(
      <ListScaffold {...baseProps} isEmpty={true}>
        <Text>Content</Text>
      </ListScaffold>,
    );
    expect(getByText("No Items")).toBeTruthy();
    expect(getByText("Nothing here yet.")).toBeTruthy();
  });

  it("renders children when not loading and not empty", () => {
    const { getByText } = render(
      <ListScaffold {...baseProps}>
        <Text>List Content</Text>
      </ListScaffold>,
    );
    expect(getByText("List Content")).toBeTruthy();
  });

  it("shows back to top button text", () => {
    const { getByText } = render(
      <ListScaffold {...baseProps}>
        <Text>Content</Text>
      </ListScaffold>,
    );
    expect(getByText("Back to top")).toBeTruthy();
  });
});
