import { ErrorScreen } from "@/components/ui/error-screen";
import { fireEvent, render } from "@/test/utils";

describe("ErrorScreen", () => {
  it("renders app logo", () => {
    const { getByTestId } = render(<ErrorScreen title="Error" />);
    expect(getByTestId("error-screen-logo")).toBeTruthy();
  });

  it("renders title", () => {
    const { getByText } = render(<ErrorScreen title="Something went wrong" />);
    expect(getByText("Something went wrong")).toBeTruthy();
  });

  it("renders subtitle when provided", () => {
    const { getByText } = render(<ErrorScreen title="Error" subtitle="Please try again later" />);
    expect(getByText("Please try again later")).toBeTruthy();
  });

  it("renders retry button when onRetry is provided", () => {
    const onRetry = jest.fn();
    const { getByTestId } = render(<ErrorScreen title="Error" onRetry={onRetry} />);
    fireEvent.press(getByTestId("error-screen-retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows custom retry label", () => {
    const { getByText } = render(
      <ErrorScreen title="Error" onRetry={jest.fn()} retryLabel="Reload" />,
    );
    expect(getByText("Reload")).toBeTruthy();
  });

  it("does not render retry button when onRetry is not provided", () => {
    const { queryByTestId } = render(<ErrorScreen title="Error" />);
    expect(queryByTestId("error-screen-retry")).toBeNull();
  });

  it("always shows Go Back button", () => {
    const { getByText } = render(<ErrorScreen title="Error" />);
    expect(getByText("Go Back")).toBeTruthy();
  });
});
