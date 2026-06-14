import { ConfirmDialog, confirm } from "@/components/ui/confirm-dialog";
import { fireEvent, render, waitFor } from "@/test/utils";

// Mock AppModal to just render children when visible
jest.mock("@/components/ui/app-modal", () => {
  return {
    AppModal: ({ children, visible }: { children: React.ReactNode; visible: boolean }) =>
      visible ? children : null,
  };
});

describe("ConfirmDialog", () => {
  it("renders nothing when no confirm is pending", () => {
    const { toJSON } = render(<ConfirmDialog />);
    expect(toJSON()).toBeNull();
  });

  it("shows dialog with title and message when confirm() is called", async () => {
    const { getByText } = render(<ConfirmDialog />);

    // Don't await - we need the dialog to render
    let _result: boolean | null = null;
    confirm({ title: "Delete?", message: "This is permanent." }).then((r) => {
      _result = r;
    });

    await waitFor(() => {
      expect(getByText("Delete?")).toBeTruthy();
      expect(getByText("This is permanent.")).toBeTruthy();
    });
  });

  it("resolves true when Confirm is pressed", async () => {
    const { getByText } = render(<ConfirmDialog />);

    let result: boolean | null = null;
    confirm({ title: "Continue?", message: "Are you sure?" }).then((r) => {
      result = r;
    });

    await waitFor(() => expect(getByText("Confirm")).toBeTruthy());
    fireEvent.press(getByText("Confirm"));
    await waitFor(() => expect(result).toBe(true));
  });

  it("resolves false when Cancel is pressed", async () => {
    const { getByText } = render(<ConfirmDialog />);

    let result: boolean | null = null;
    confirm({ title: "Continue?", message: "Are you sure?" }).then((r) => {
      result = r;
    });

    await waitFor(() => expect(getByText("Cancel")).toBeTruthy());
    fireEvent.press(getByText("Cancel"));
    await waitFor(() => expect(result).toBe(false));
  });

  it("renders custom confirm and cancel labels", async () => {
    const { getByText } = render(<ConfirmDialog />);

    confirm({
      title: "Remove?",
      message: "Gone forever.",
      confirmLabel: "Yes, Remove",
      cancelLabel: "Keep",
    });

    await waitFor(() => {
      expect(getByText("Yes, Remove")).toBeTruthy();
      expect(getByText("Keep")).toBeTruthy();
    });
  });
});
