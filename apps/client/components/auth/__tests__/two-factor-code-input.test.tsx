import { fireEvent, waitFor } from "@testing-library/react-native";
import { TwoFactorCodeInput } from "@/components/auth/two-factor-code-input";
import { render } from "@/test/utils";

describe("TwoFactorCodeInput", () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders 6 digit inputs", () => {
    const { getByTestId } = render(
      <TwoFactorCodeInput onComplete={mockOnComplete} testID="code" />,
    );
    for (let i = 0; i < 6; i++) {
      expect(getByTestId(`code-digit-${i}`)).toBeTruthy();
    }
  });

  it("calls onComplete when pasting a full code", () => {
    const { getByTestId } = render(
      <TwoFactorCodeInput onComplete={mockOnComplete} testID="code" />,
    );
    fireEvent.changeText(getByTestId("code-digit-0"), "123456");
    expect(mockOnComplete).toHaveBeenCalledWith("123456");
  });

  it("ignores non-numeric input", () => {
    const { getByTestId } = render(
      <TwoFactorCodeInput onComplete={mockOnComplete} testID="code" />,
    );
    fireEvent.changeText(getByTestId("code-digit-0"), "abc");
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it("clears on error", async () => {
    const { rerender, getByTestId } = render(
      <TwoFactorCodeInput onComplete={mockOnComplete} testID="code" />,
    );
    fireEvent.changeText(getByTestId("code-digit-0"), "1");

    rerender(<TwoFactorCodeInput onComplete={mockOnComplete} testID="code" error="Bad code" />);

    await waitFor(() => {
      expect(getByTestId("code-digit-0").props.value).toBe("");
    });
  });

  it("shows error text", () => {
    const { getByText } = render(
      <TwoFactorCodeInput onComplete={mockOnComplete} testID="code" error="Invalid code" />,
    );
    expect(getByText("Invalid code")).toBeTruthy();
  });
});
