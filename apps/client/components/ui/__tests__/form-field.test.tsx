import { Text } from "react-native";
import { FormField } from "@/components/ui/form-field";
import { render } from "@/test/utils";

describe("FormField", () => {
  it("renders label and children", () => {
    const { getByText } = render(
      <FormField label="Email">
        <Text>input here</Text>
      </FormField>,
    );
    expect(getByText("Email")).toBeTruthy();
    expect(getByText("input here")).toBeTruthy();
  });

  it("renders hint when provided", () => {
    const { getByText } = render(
      <FormField label="Name" hint="Enter your full name">
        <Text>input</Text>
      </FormField>,
    );
    expect(getByText("Enter your full name")).toBeTruthy();
  });

  it("renders error message", () => {
    const { getByText } = render(
      <FormField label="Email" error="Email is required">
        <Text>input</Text>
      </FormField>,
    );
    expect(getByText("Email is required")).toBeTruthy();
  });

  it("renders without label or hint", () => {
    const { getByText } = render(
      <FormField>
        <Text>just children</Text>
      </FormField>,
    );
    expect(getByText("just children")).toBeTruthy();
  });
});
