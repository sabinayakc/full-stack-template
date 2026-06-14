import { extractDigits, PhoneInput } from "@/components/ui/phone-input";
import { fireEvent, render } from "@/test/utils";

describe("extractDigits", () => {
  it("strips non-digits", () => {
    expect(extractDigits("(555) 123-4567")).toBe("5551234567");
  });

  it("limits to 10 digits", () => {
    expect(extractDigits("12345678901234")).toBe("1234567890");
  });

  it("returns empty for no digits", () => {
    expect(extractDigits("abc")).toBe("");
  });
});

describe("PhoneInput", () => {
  it("renders with label", () => {
    const { getByText } = render(<PhoneInput value="" onChangeText={jest.fn()} label="Phone" />);
    expect(getByText("Phone")).toBeTruthy();
  });

  it("renders placeholder", () => {
    const { getByPlaceholderText } = render(<PhoneInput value="" onChangeText={jest.fn()} />);
    expect(getByPlaceholderText("(555) 123-4567")).toBeTruthy();
  });

  it("displays formatted phone number", () => {
    const { getByDisplayValue } = render(
      <PhoneInput value="5551234567" onChangeText={jest.fn()} />,
    );
    expect(getByDisplayValue("(555) 123-4567")).toBeTruthy();
  });

  it("calls onChangeText with formatted and digits", () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(<PhoneInput value="" onChangeText={onChangeText} />);
    fireEvent.changeText(getByPlaceholderText("(555) 123-4567"), "555");
    expect(onChangeText).toHaveBeenCalledWith("(555", "555");
  });

  it("renders error message", () => {
    const { getByText } = render(<PhoneInput value="" onChangeText={jest.fn()} error="Required" />);
    expect(getByText("Required")).toBeTruthy();
  });

  it("renders hint", () => {
    const { getByText } = render(
      <PhoneInput value="" onChangeText={jest.fn()} hint="US numbers only" />,
    );
    expect(getByText("US numbers only")).toBeTruthy();
  });
});
