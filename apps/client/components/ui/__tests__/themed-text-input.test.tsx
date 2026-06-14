import { ThemedTextInput } from "@/components/ui/themed-text-input";
import { fireEvent, render } from "@/test/utils";

describe("ThemedTextInput", () => {
  it("renders with label", () => {
    const { getByText } = render(<ThemedTextInput label="Email" />);
    expect(getByText("Email")).toBeTruthy();
  });

  it("renders placeholder", () => {
    const { getByPlaceholderText } = render(<ThemedTextInput placeholder="Enter email" />);
    expect(getByPlaceholderText("Enter email")).toBeTruthy();
  });

  it("renders error message", () => {
    const { getByText } = render(<ThemedTextInput label="Email" error="Required" />);
    expect(getByText("Required")).toBeTruthy();
  });

  it("renders hint", () => {
    const { getByText } = render(<ThemedTextInput label="Name" hint="Your full name" />);
    expect(getByText("Your full name")).toBeTruthy();
  });

  it("fires onChangeText", () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(
      <ThemedTextInput placeholder="Type" onChangeText={onChange} />,
    );
    fireEvent.changeText(getByPlaceholderText("Type"), "hello");
    expect(onChange).toHaveBeenCalledWith("hello");
  });

  it("renders without label", () => {
    const { getByPlaceholderText } = render(<ThemedTextInput placeholder="No label" />);
    expect(getByPlaceholderText("No label")).toBeTruthy();
  });
});
