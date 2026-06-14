import { Text } from "react-native";
import { Collapsible } from "@/components/ui/collapsible";
import { fireEvent, render } from "@/test/utils";

describe("Collapsible", () => {
  it("renders title", () => {
    const { getByText } = render(
      <Collapsible title="Details">
        <Text>Hidden content</Text>
      </Collapsible>,
    );
    expect(getByText("Details")).toBeTruthy();
  });

  it("does not show children initially", () => {
    const { queryByText } = render(
      <Collapsible title="Details">
        <Text>Hidden content</Text>
      </Collapsible>,
    );
    expect(queryByText("Hidden content")).toBeNull();
  });

  it("shows children after pressing title", () => {
    const { getByText } = render(
      <Collapsible title="Details">
        <Text>Hidden content</Text>
      </Collapsible>,
    );
    fireEvent.press(getByText("Details"));
    expect(getByText("Hidden content")).toBeTruthy();
  });

  it("hides children after pressing title again", () => {
    const { getByText, queryByText } = render(
      <Collapsible title="Details">
        <Text>Hidden content</Text>
      </Collapsible>,
    );
    fireEvent.press(getByText("Details"));
    expect(getByText("Hidden content")).toBeTruthy();
    fireEvent.press(getByText("Details"));
    expect(queryByText("Hidden content")).toBeNull();
  });
});
