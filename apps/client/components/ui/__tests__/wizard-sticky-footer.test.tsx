import { WizardStickyFooter } from "@/components/ui/wizard-sticky-footer";
import { fireEvent, render } from "@/test/utils";

describe("WizardStickyFooter", () => {
  const baseProps = {
    canGoBack: false,
    isLastStep: false,
    onContinue: jest.fn(),
    onBack: jest.fn(),
    onExit: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("shows Continue button", () => {
    const { getByText } = render(<WizardStickyFooter {...baseProps} />);
    expect(getByText("Continue")).toBeTruthy();
  });

  it("shows exit label when canGoBack is false", () => {
    const { getByText } = render(<WizardStickyFooter {...baseProps} />);
    expect(getByText("Exit")).toBeTruthy();
  });

  it("shows Back when canGoBack is true", () => {
    const { getByText } = render(<WizardStickyFooter {...baseProps} canGoBack />);
    expect(getByText("Back")).toBeTruthy();
  });

  it("shows last step label on final step", () => {
    const { getByText } = render(
      <WizardStickyFooter {...baseProps} isLastStep lastStepLabel="Create" />,
    );
    expect(getByText("Create")).toBeTruthy();
  });

  it("fires onContinue when Continue is pressed", () => {
    const onContinue = jest.fn();
    const { getByTestId } = render(<WizardStickyFooter {...baseProps} onContinue={onContinue} />);
    fireEvent.press(getByTestId("wizard-continue"));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it("fires onExit when Exit is pressed on first step", () => {
    const onExit = jest.fn();
    const { getByTestId } = render(<WizardStickyFooter {...baseProps} onExit={onExit} />);
    fireEvent.press(getByTestId("wizard-exit"));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("fires onBack when Back is pressed", () => {
    const onBack = jest.fn();
    const { getByTestId } = render(<WizardStickyFooter {...baseProps} canGoBack onBack={onBack} />);
    fireEvent.press(getByTestId("wizard-back"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("shows status text when provided", () => {
    const { getByText } = render(<WizardStickyFooter {...baseProps} statusText="Saved 2:35 PM" />);
    expect(getByText("Saved 2:35 PM")).toBeTruthy();
  });

  it("shows loading text when loading", () => {
    const { getByText } = render(
      <WizardStickyFooter {...baseProps} isLoading loadingText="Saving..." />,
    );
    expect(getByText("Saving...")).toBeTruthy();
  });

  it("shows custom exit label", () => {
    const { getByText } = render(<WizardStickyFooter {...baseProps} exitLabel="Cancel" />);
    expect(getByText("Cancel")).toBeTruthy();
  });
});
