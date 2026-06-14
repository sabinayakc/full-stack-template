import { Text } from "react-native";
import { KeyboardView } from "@/components/ui/keyboard-view";
import { render } from "@/test/utils";

describe("KeyboardView", () => {
  it("renders children", () => {
    const { getByText } = render(
      <KeyboardView>
        <Text>Inner Content</Text>
      </KeyboardView>,
    );
    expect(getByText("Inner Content")).toBeTruthy();
  });

  it("renders without crashing with custom offset", () => {
    const { getByText } = render(
      <KeyboardView keyboardVerticalOffset={100}>
        <Text>Content</Text>
      </KeyboardView>,
    );
    expect(getByText("Content")).toBeTruthy();
  });
});
