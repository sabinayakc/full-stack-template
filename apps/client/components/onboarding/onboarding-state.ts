import type { CompanySize, OrganizationOnboardingData } from "@repo/shared";

export interface OnboardingState {
  organization: OrganizationOnboardingData;
  userPreferences: {
    jobTitle: string;
  };
  invitations: Array<{ email: string; role: string }>;
}

export const INITIAL_ONBOARDING_STATE: OnboardingState = {
  organization: {
    name: "",
    slug: "",
    orgType: "business",
    companySize: undefined,
    phone: "",
    website: "",
  },
  userPreferences: {
    jobTitle: "",
  },
  invitations: [],
};

export const COMPANY_SIZE_OPTIONS: Array<{ value: CompanySize; label: string; desc: string }> = [
  { value: "solo", label: "Just me", desc: "Solo operator" },
  { value: "small", label: "2–10", desc: "Small team" },
  { value: "medium", label: "11–50", desc: "Growing company" },
  { value: "large", label: "50+", desc: "Large operation" },
];
