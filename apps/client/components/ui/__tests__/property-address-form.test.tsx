import { PropertyAddressForm, propertyAddressSchema } from "@/components/ui/property-address-form";
import { fireEvent, render } from "@/test/utils";

// Mock GooglePlacesAutocompleteField to a simple TextInput
jest.mock("@/components/ui/google-places-autocomplete-field", () => {
  const { TextInput } = require("react-native");
  return {
    GooglePlacesAutocompleteField: ({
      value,
      onChangeText,
      placeholder,
      testID,
    }: {
      value: string;
      onChangeText: (v: string) => void;
      placeholder: string;
      testID: string;
    }) => (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        testID={testID}
      />
    ),
  };
});

describe("propertyAddressSchema", () => {
  it("validates correct data", () => {
    const result = propertyAddressSchema.safeParse({
      addressLine1: "123 Main St",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing fields", () => {
    const result = propertyAddressSchema.safeParse({
      addressLine1: "",
      city: "",
      state: "",
      postalCode: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("PropertyAddressForm", () => {
  it("renders all fields", () => {
    const { getByTestId, getByPlaceholderText } = render(
      <PropertyAddressForm onSubmit={jest.fn()} onCancel={jest.fn()} />,
    );
    expect(getByTestId("property-address-address")).toBeTruthy();
    expect(getByPlaceholderText("City")).toBeTruthy();
    expect(getByPlaceholderText("ST")).toBeTruthy();
    expect(getByPlaceholderText("ZIP")).toBeTruthy();
  });

  it("renders submit and cancel buttons", () => {
    const { getByText } = render(<PropertyAddressForm onSubmit={jest.fn()} onCancel={jest.fn()} />);
    expect(getByText("Add")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
  });

  it("renders custom submit label", () => {
    const { getByText } = render(
      <PropertyAddressForm onSubmit={jest.fn()} onCancel={jest.fn()} submitLabel="Save" />,
    );
    expect(getByText("Save")).toBeTruthy();
  });

  it("calls onCancel when Cancel pressed", () => {
    const onCancel = jest.fn();
    const { getByText } = render(<PropertyAddressForm onSubmit={jest.fn()} onCancel={onCancel} />);
    fireEvent.press(getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
