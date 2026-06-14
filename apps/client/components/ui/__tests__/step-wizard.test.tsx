import { Text } from "react-native";
import { StepWizard, type WizardStep } from "@/components/ui/step-wizard";
import { fireEvent, render, waitFor } from "@/test/utils";

describe("StepWizard", () => {
  const createSteps = (onComplete: jest.Mock): WizardStep[] => [
    {
      id: "step1",
      title: "Step One",
      subtitle: "First step",
      content: <Text>Step 1 Content</Text>,
      validate: () => true,
    },
    {
      id: "step2",
      title: "Step Two",
      content: <Text>Step 2 Content</Text>,
    },
    {
      id: "step3",
      title: "Step Three",
      content: <Text>Step 3 Content</Text>,
    },
  ];

  it("renders the first step", () => {
    const onComplete = jest.fn();
    const { getByText } = render(
      <StepWizard
        steps={createSteps(onComplete)}
        onComplete={onComplete}
        renderFooter={(helpers) => (
          <Text onPress={helpers.goNext}>{helpers.isLastStep ? "Finish" : "Next"}</Text>
        )}
      />,
    );

    expect(getByText("Step 1 of 3")).toBeTruthy();
    expect(getByText("Step One")).toBeTruthy();
    expect(getByText("Step 1 Content")).toBeTruthy();
  });

  it("shows subtitle when provided", () => {
    const onComplete = jest.fn();
    const { getByText } = render(
      <StepWizard steps={createSteps(onComplete)} onComplete={onComplete} />,
    );

    expect(getByText("First step")).toBeTruthy();
  });

  it("skips steps with skip=true", () => {
    const onComplete = jest.fn();
    const steps: WizardStep[] = [
      { id: "s1", title: "First", content: <Text>C1</Text> },
      { id: "s2", title: "Skipped", content: <Text>C2</Text>, skip: true },
      { id: "s3", title: "Third", content: <Text>C3</Text> },
    ];

    const { getByText } = render(<StepWizard steps={steps} onComplete={onComplete} />);

    expect(getByText("Step 1 of 2")).toBeTruthy();
  });

  it("shows validation error when validate returns string", async () => {
    const onComplete = jest.fn();
    const steps: WizardStep[] = [
      {
        id: "s1",
        title: "First",
        content: <Text>Content</Text>,
        validate: () => "Field is required",
      },
    ];

    const { getByText } = render(
      <StepWizard
        steps={steps}
        onComplete={onComplete}
        renderFooter={(helpers) => <Text onPress={helpers.goNext}>Next</Text>}
      />,
    );

    fireEvent.press(getByText("Next"));
    await waitFor(() => {
      expect(getByText("Field is required")).toBeTruthy();
    });
  });
});
