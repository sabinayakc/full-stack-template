import { Text } from "react-native";
import { InlineCreatePanel } from "@/components/ui/inline-create-panel";
import { fireEvent, render } from "@/test/utils";

describe("InlineCreatePanel", () => {
  it("renders toggle button with label", () => {
    const { getByText } = render(
      <InlineCreatePanel buttonLabel="Add Item" isOpen={false} onToggle={jest.fn()}>
        <Text>Form</Text>
      </InlineCreatePanel>,
    );
    expect(getByText("Add Item")).toBeTruthy();
  });

  it("does not render children when closed", () => {
    const { queryByText } = render(
      <InlineCreatePanel buttonLabel="Add Item" isOpen={false} onToggle={jest.fn()}>
        <Text>Form Content</Text>
      </InlineCreatePanel>,
    );
    expect(queryByText("Form Content")).toBeNull();
  });

  it("renders children when open", () => {
    const { getByText } = render(
      <InlineCreatePanel buttonLabel="Add Item" isOpen={true} onToggle={jest.fn()}>
        <Text>Form Content</Text>
      </InlineCreatePanel>,
    );
    expect(getByText("Form Content")).toBeTruthy();
  });

  it("calls onToggle when button pressed", () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <InlineCreatePanel buttonLabel="Add Item" isOpen={false} onToggle={onToggle}>
        <Text>Form</Text>
      </InlineCreatePanel>,
    );
    fireEvent.press(getByText("Add Item"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("renders with toggleTestID", () => {
    const { getByTestId } = render(
      <InlineCreatePanel
        buttonLabel="Add"
        isOpen={false}
        onToggle={jest.fn()}
        toggleTestID="add-toggle"
      >
        <Text>Form</Text>
      </InlineCreatePanel>,
    );
    expect(getByTestId("add-toggle")).toBeTruthy();
  });
});
