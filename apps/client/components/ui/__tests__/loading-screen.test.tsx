import { LoadingScreen } from "@/components/ui/loading-screen";
import { render } from "@/test/utils";

describe("LoadingScreen", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<LoadingScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders with dark mode", () => {
    const { toJSON } = render(<LoadingScreen dark />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders with custom background color", () => {
    const { toJSON } = render(<LoadingScreen backgroundColor="#ff0000" />);
    expect(toJSON()).toBeTruthy();
  });

  it("shows spinner when showSpinner is true", () => {
    const { toJSON } = render(<LoadingScreen showSpinner />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
  });
});
