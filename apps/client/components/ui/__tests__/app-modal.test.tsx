import { Text } from "react-native";
import { AppModal } from "@/components/ui/app-modal";
import { render } from "@/test/utils";

describe("AppModal", () => {
  it("renders children when visible", () => {
    const { getByText } = render(
      <AppModal visible={true}>
        <Text>Modal Content</Text>
      </AppModal>,
    );
    expect(getByText("Modal Content")).toBeTruthy();
  });

  it("does not render children when not visible", () => {
    const { queryByText } = render(
      <AppModal visible={false}>
        <Text>Modal Content</Text>
      </AppModal>,
    );
    expect(queryByText("Modal Content")).toBeNull();
  });
});
