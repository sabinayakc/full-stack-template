import { Text } from "react-native";
import { OperationOverlay } from "@/components/ui/operation-overlay";
import { render } from "@/test/utils";

describe("OperationOverlay", () => {
  it("renders children", () => {
    const { getByText } = render(
      <OperationOverlay visible={false}>
        <Text>Card Content</Text>
      </OperationOverlay>,
    );
    expect(getByText("Card Content")).toBeTruthy();
  });

  it("renders children when visible", () => {
    const { getByText } = render(
      <OperationOverlay visible={true}>
        <Text>Card Content</Text>
      </OperationOverlay>,
    );
    expect(getByText("Card Content")).toBeTruthy();
  });

  it("shows spinner when visible", () => {
    const { toJSON } = render(
      <OperationOverlay visible={true}>
        <Text>Content</Text>
      </OperationOverlay>,
    );
    const tree = JSON.stringify(toJSON());
    // The overlay contains an ActivityIndicator
    expect(tree).toContain("ActivityIndicator");
  });

  it("does not show overlay when not visible", () => {
    const { toJSON } = render(
      <OperationOverlay visible={false}>
        <Text>Content</Text>
      </OperationOverlay>,
    );
    const tree = JSON.stringify(toJSON());
    expect(tree).not.toContain("ActivityIndicator");
  });
});
