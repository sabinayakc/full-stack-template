import { fireEvent, render, waitFor } from "@/test/utils";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  useLocalSearchParams: () => ({}),
  Link: Object.assign(({ children }: { children: React.ReactNode }) => children, {
    Trigger: () => null,
    Menu: () => null,
    MenuAction: () => null,
    Preview: () => null,
  }),
}));

jest.mock("expo-image", () => ({
  Image: "Image",
}));

jest.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ setActiveOrganization: jest.fn() }),
}));

import Onboarding from "../onboarding";

const mockFetchWithAuth = jest.fn();

jest.mock("@/lib/api", () => ({
  fetchWithAuth: (...args: unknown[]) => mockFetchWithAuth(...args),
}));

describe("Onboarding", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchWithAuth.mockReset();
  });

  it("renders the wizard with organization step first", () => {
    const { getByText } = render(<Onboarding />);

    expect(getByText("Step 1 of 4")).toBeTruthy();
    expect(getByText("Set Up Your Organization")).toBeTruthy();
    expect(getByText("Company Name")).toBeTruthy();
    expect(getByText("URL Slug")).toBeTruthy();
  });

  it("shows validation error when continuing without org name", () => {
    const { getByText } = render(<Onboarding />);

    fireEvent.press(getByText("Continue"));

    expect(getByText("Organization name is required")).toBeTruthy();
  });

  it("shows validation error for invalid slug", () => {
    const { getByText, getByPlaceholderText } = render(<Onboarding />);

    fireEvent.changeText(getByPlaceholderText("Acme Inc"), "Test Org");
    fireEvent.changeText(getByPlaceholderText("acme-inc"), "--");
    fireEvent.press(getByText("Continue"));

    expect(getByText("Slug must be lowercase with dashes only")).toBeTruthy();
  });

  it("auto-generates slug from organization name", () => {
    const { getByPlaceholderText } = render(<Onboarding />);

    fireEvent.changeText(getByPlaceholderText("Acme Inc"), "My Great Company");

    const slugInput = getByPlaceholderText("acme-inc");
    expect(slugInput.props.value).toBe("my-great-company");
  });

  it("navigates to preferences step after valid org", async () => {
    const { getByText, getByPlaceholderText } = render(<Onboarding />);

    fireEvent.changeText(getByPlaceholderText("Acme Inc"), "Test Company");
    fireEvent.press(getByText("Continue"));

    await waitFor(() => {
      expect(getByText("Step 2 of 4")).toBeTruthy();
      expect(getByText("Your Preferences")).toBeTruthy();
    });
  });

  it("shows back button on second step", async () => {
    const { getByText, getByPlaceholderText } = render(<Onboarding />);

    fireEvent.changeText(getByPlaceholderText("Acme Inc"), "Test Company");
    fireEvent.press(getByText("Continue"));

    await waitFor(() => {
      expect(getByText("Back")).toBeTruthy();
    });
  });

  it("renders preferences fields on preferences step", async () => {
    const { getByText, getByPlaceholderText } = render(<Onboarding />);

    fireEvent.changeText(getByPlaceholderText("Acme Inc"), "Test Company");
    fireEvent.press(getByText("Continue"));

    await waitFor(() => {
      expect(getByText("Your Job Title (optional)")).toBeTruthy();
    });
  });
});
