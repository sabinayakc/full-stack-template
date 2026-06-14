import * as Clipboard from "expo-clipboard";
import { ThemedText } from "@/components/ui/themed-text";
import { fireEvent, render } from "@/test/utils";

describe("ThemedText", () => {
  it("renders children text", () => {
    const { getByText } = render(<ThemedText>Hello</ThemedText>);
    expect(getByText("Hello")).toBeTruthy();
  });

  it("renders with different types without crashing", () => {
    const types = ["default", "secondary", "title", "subtitle", "label", "caption"] as const;
    for (const type of types) {
      const { getByText } = render(<ThemedText type={type}>Text</ThemedText>);
      expect(getByText("Text")).toBeTruthy();
    }
  });

  it("does not wrap in Pressable when not copyable", () => {
    const { toJSON } = render(<ThemedText>Plain</ThemedText>);
    const tree = toJSON() as { type: string } | null;
    // Non-copyable renders a plain Text, not a Pressable wrapper
    expect(tree?.type).toBe("Text");
  });

  it("copies text to clipboard when copyable and pressed", async () => {
    const { getByText } = render(<ThemedText copyable>Copy me</ThemedText>);
    fireEvent.press(getByText("Copy me"));
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith("Copy me");
  });
});
