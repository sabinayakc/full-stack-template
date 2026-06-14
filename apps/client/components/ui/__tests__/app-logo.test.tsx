import { AppLogo } from "@/components/ui/app-logo";
import { render } from "@/test/utils";

describe("AppLogo", () => {
  it("renders with default icon variant", () => {
    const { getByTestId } = render(<AppLogo testID="logo" />);
    expect(getByTestId("logo")).toBeTruthy();
  });

  it("renders splash variant", () => {
    const { getByTestId } = render(<AppLogo variant="splash" testID="logo" />);
    expect(getByTestId("logo")).toBeTruthy();
  });

  it("applies custom size", () => {
    const { getByTestId } = render(<AppLogo size={64} testID="logo" />);
    const logo = getByTestId("logo");
    expect(logo.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ width: 64, height: 64 })]),
    );
  });

  it("applies custom style", () => {
    const { getByTestId } = render(<AppLogo testID="logo" style={{ marginBottom: 10 }} />);
    const logo = getByTestId("logo");
    expect(logo.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ marginBottom: 10 })]),
    );
  });

  it("wraps in container when containerStyle is provided", () => {
    const { toJSON } = render(<AppLogo testID="logo" containerStyle={{ padding: 16 }} />);
    const json = toJSON()!;
    const tree = Array.isArray(json) ? json[0] : json;
    const styles = [tree.props.style].flat();
    expect(styles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ alignItems: "center", justifyContent: "center" }),
        expect.objectContaining({ padding: 16 }),
      ]),
    );
    expect(tree.children).toBeTruthy();
  });
});
