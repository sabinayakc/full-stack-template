import { INITIAL_ONBOARDING_STATE } from "@/components/onboarding/onboarding-state";
import { PreferencesStep } from "@/components/onboarding/preferences-step";
import { fireEvent, render } from "@/test/utils";

describe("PreferencesStep", () => {
  it("renders field labels", () => {
    const { getByText } = render(
      <PreferencesStep state={INITIAL_ONBOARDING_STATE} onChange={jest.fn()} />,
    );
    expect(getByText("Your Job Title (optional)")).toBeTruthy();
  });

  it("calls onChange when job title is typed", () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <PreferencesStep state={INITIAL_ONBOARDING_STATE} onChange={onChange} />,
    );
    fireEvent.changeText(getByTestId("onboarding-job-title"), "Manager");
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        userPreferences: expect.objectContaining({ jobTitle: "Manager" }),
      }),
    );
  });
});
