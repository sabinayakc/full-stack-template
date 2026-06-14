import { INITIAL_ONBOARDING_STATE } from "@/components/onboarding/onboarding-state";
import { OrganizationStep } from "@/components/onboarding/organization-step";
import { fireEvent, render } from "@/test/utils";

describe("OrganizationStep", () => {
  it("renders field labels", () => {
    const { getByText } = render(
      <OrganizationStep state={INITIAL_ONBOARDING_STATE} onChange={jest.fn()} />,
    );
    expect(getByText("Company Name")).toBeTruthy();
    expect(getByText("URL Slug")).toBeTruthy();
    expect(getByText("Company Size")).toBeTruthy();
  });

  it("renders company size options", () => {
    const { getByText } = render(
      <OrganizationStep state={INITIAL_ONBOARDING_STATE} onChange={jest.fn()} />,
    );
    expect(getByText("Just me")).toBeTruthy();
    expect(getByText("2–10")).toBeTruthy();
    expect(getByText("11–50")).toBeTruthy();
    expect(getByText("50+")).toBeTruthy();
  });

  it("calls onChange when name is typed", () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <OrganizationStep state={INITIAL_ONBOARDING_STATE} onChange={onChange} />,
    );
    fireEvent.changeText(getByTestId("onboarding-org-name"), "Acme Corp");
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        organization: expect.objectContaining({ name: "Acme Corp", slug: "acme-corp" }),
      }),
    );
  });

  it("renders validation errors", () => {
    const { getByText } = render(
      <OrganizationStep
        state={INITIAL_ONBOARDING_STATE}
        onChange={jest.fn()}
        errors={{ name: "Name is required" }}
      />,
    );
    expect(getByText("Name is required")).toBeTruthy();
  });
});
