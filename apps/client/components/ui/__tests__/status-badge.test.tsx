import { StatusBadge } from "@/components/ui/status-badge";
import { render } from "@/test/utils";

const colorMap = {
  active: { bg: "#d1fae5", text: "#065f46" },
  inactive: { bg: "#fee2e2", text: "#991b1b" },
};

describe("StatusBadge", () => {
  it("renders status text", () => {
    const { getByText } = render(<StatusBadge status="active" colorMap={colorMap} />);
    expect(getByText("active")).toBeTruthy();
  });

  it("uses fallback colors for unknown status", () => {
    const { getByText } = render(<StatusBadge status="unknown" colorMap={colorMap} />);
    expect(getByText("unknown")).toBeTruthy();
  });

  it("uses fallbackKey when status is not in colorMap", () => {
    const { getByText } = render(
      <StatusBadge status="pending" colorMap={colorMap} fallbackKey="inactive" />,
    );
    expect(getByText("pending")).toBeTruthy();
  });
});
