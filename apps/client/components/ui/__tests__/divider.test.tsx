import { Divider } from "@/components/ui/divider";
import { render } from "@/test/utils";

describe("Divider", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<Divider />);
    expect(toJSON()).toBeTruthy();
  });

  it("passes through style prop", () => {
    const { toJSON } = render(<Divider style={{ marginVertical: 10 }} />);
    const node = toJSON();
    expect(node).toBeTruthy();
  });
});
