import { Button } from "@/components/ui/button";
import { fireEvent, render } from "@/test/utils";

describe("Button", () => {
  it("renders text children", () => {
    const { getByText } = render(<Button>Save</Button>);
    expect(getByText("Save")).toBeTruthy();
  });

  it("fires onPress", () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Tap</Button>);
    fireEvent.press(getByText("Tap"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button disabled onPress={onPress}>
        No
      </Button>,
    );
    fireEvent.press(getByText("No"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("shows loading state with default text", () => {
    const { getByText } = render(<Button isLoading>Save</Button>);
    expect(getByText("Please wait")).toBeTruthy();
  });

  it("shows custom loading text", () => {
    const { getByText } = render(
      <Button isLoading loadingText="Saving...">
        Save
      </Button>,
    );
    expect(getByText("Saving...")).toBeTruthy();
  });

  it("is disabled while loading", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button isLoading onPress={onPress}>
        Save
      </Button>,
    );
    fireEvent.press(getByText("Please wait"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("applies testID", () => {
    const { getByTestId } = render(<Button testID="my-btn">OK</Button>);
    expect(getByTestId("my-btn")).toBeTruthy();
  });
});
