import SupportScreen from "@/app/(app)/settings/support/contact";
import { render } from "@/test/utils";

jest.mock("expo-mail-composer", () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  composeAsync: jest.fn().mockResolvedValue({}),
}));

jest.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn(), info: jest.fn(), warning: jest.fn() }),
}));

describe("SupportScreen", () => {
  it("renders hero title", () => {
    const { getByText } = render(<SupportScreen />);
    expect(getByText("How can we help?")).toBeTruthy();
  });

  it("renders email support option", () => {
    const { getByText } = render(<SupportScreen />);
    expect(getByText("Email Support")).toBeTruthy();
    expect(getByText("Get help from our team")).toBeTruthy();
  });

  it("renders bug report option", () => {
    const { getByText } = render(<SupportScreen />);
    expect(getByText("Report a Bug")).toBeTruthy();
  });

  it("renders feature request option", () => {
    const { getByText } = render(<SupportScreen />);
    expect(getByText("Feature Request")).toBeTruthy();
  });

  it("renders app version", () => {
    const { getByText } = render(<SupportScreen />);
    expect(getByText(/App v/)).toBeTruthy();
  });
});
