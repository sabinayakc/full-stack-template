import { SummaryStep } from "@/components/onboarding/summary-step";
import { render } from "@/test/utils";

const state = {
  organization: {
    name: "Acme Corp",
    slug: "acme-corp",
    orgType: "business" as const,
    companySize: "small" as const,
    phone: "555-1234",
    website: "",
  },
  userPreferences: {
    jobTitle: "Owner",
  },
  invitations: [{ email: "bob@test.com", role: "member" }],
};

describe("SummaryStep", () => {
  it("renders organization details", () => {
    const { getByText } = render(<SummaryStep state={state} />);
    expect(getByText("Acme Corp")).toBeTruthy();
    expect(getByText("acme-corp")).toBeTruthy();
    expect(getByText("2–10")).toBeTruthy();
  });

  it("renders user preferences", () => {
    const { getByText } = render(<SummaryStep state={state} />);
    expect(getByText("Owner")).toBeTruthy();
  });

  it("renders team invitations", () => {
    const { getByText } = render(<SummaryStep state={state} />);
    expect(getByText("bob@test.com")).toBeTruthy();
    expect(getByText("member")).toBeTruthy();
  });

  it("hides invitations section when empty", () => {
    const noInvites = { ...state, invitations: [] };
    const { queryByText } = render(<SummaryStep state={noInvites} />);
    expect(queryByText(/Team Invitations/)).toBeNull();
  });
});
