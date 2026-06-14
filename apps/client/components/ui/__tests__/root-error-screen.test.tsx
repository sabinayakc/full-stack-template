import { RootErrorScreen } from "@/components/ui/root-error-screen";
import { fireEvent, render } from "@/test/utils";

describe("RootErrorScreen", () => {
  it("renders app logo", () => {
    const { getByTestId } = render(<RootErrorScreen title="Error" />);
    expect(getByTestId("root-error-logo")).toBeTruthy();
  });

  it("renders title", () => {
    const { getByText } = render(<RootErrorScreen title="Server Unreachable" />);
    expect(getByText("Server Unreachable")).toBeTruthy();
  });

  it("renders subtitle when provided", () => {
    const { getByText } = render(
      <RootErrorScreen title="Error" subtitle="Check your connection" />,
    );
    expect(getByText("Check your connection")).toBeTruthy();
  });

  it("does not render subtitle when not provided", () => {
    const { queryByText } = render(<RootErrorScreen title="Error" />);
    expect(queryByText("Check your connection")).toBeNull();
  });

  it("renders retry button when onRetry is provided", () => {
    const onRetry = jest.fn();
    const { getByTestId } = render(<RootErrorScreen title="Error" onRetry={onRetry} />);
    fireEvent.press(getByTestId("root-error-retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows custom retry label", () => {
    const { getByText } = render(
      <RootErrorScreen title="Error" onRetry={jest.fn()} retryLabel="Reconnect" />,
    );
    expect(getByText("Reconnect")).toBeTruthy();
  });

  it("does not render retry button when onRetry is not provided", () => {
    const { queryByTestId } = render(<RootErrorScreen title="Error" />);
    expect(queryByTestId("root-error-retry")).toBeNull();
  });
});
