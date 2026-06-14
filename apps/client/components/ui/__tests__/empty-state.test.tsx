import { EmptyState } from "@/components/ui/empty-state";
import { render } from "@/test/utils";

describe("EmptyState", () => {
  it("renders icon, title, and subtitle", () => {
    const { getByText } = render(
      <EmptyState icon="tray.fill" title="No items" subtitle="Add your first item" />,
    );
    expect(getByText("No items")).toBeTruthy();
    expect(getByText("Add your first item")).toBeTruthy();
  });
});
