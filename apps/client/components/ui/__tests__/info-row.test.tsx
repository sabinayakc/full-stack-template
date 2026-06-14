import * as Clipboard from "expo-clipboard";
import { InfoRow } from "@/components/ui/info-row";
import { fireEvent, render, waitFor } from "@/test/utils";

describe("InfoRow", () => {
  it("renders label and value", () => {
    const { getByText } = render(<InfoRow label="Email" value="test@example.com" />);
    expect(getByText("Email")).toBeTruthy();
    expect(getByText("test@example.com")).toBeTruthy();
  });

  it("returns null when value is null", () => {
    const { toJSON } = render(<InfoRow label="Email" value={null} />);
    expect(toJSON()).toBeNull();
  });

  it("returns null when value is undefined", () => {
    const { toJSON } = render(<InfoRow label="Email" value={undefined} />);
    expect(toJSON()).toBeNull();
  });

  it("copies value to clipboard when copyable and pressed", async () => {
    const { getByText } = render(<InfoRow label="Email" value="test@example.com" copyable />);
    fireEvent.press(getByText("test@example.com"));
    await waitFor(() => {
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith("test@example.com");
    });
  });
});
