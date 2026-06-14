import HelpCenterScreen from "@/app/(app)/settings/support/help-center";
import { fireEvent, render } from "@/test/utils";

describe("HelpCenterScreen", () => {
  it("renders search input", () => {
    const { getByPlaceholderText } = render(<HelpCenterScreen />);
    expect(getByPlaceholderText("Search help topics...")).toBeTruthy();
  });

  it("renders FAQ categories", () => {
    const { getByText } = render(<HelpCenterScreen />);
    expect(getByText("Getting Started")).toBeTruthy();
    expect(getByText("Notifications")).toBeTruthy();
    expect(getByText("Roles & Permissions")).toBeTruthy();
    expect(getByText("Account & Security")).toBeTruthy();
    expect(getByText("Data & Privacy")).toBeTruthy();
  });

  it("renders FAQ questions", () => {
    const { getByText } = render(<HelpCenterScreen />);
    expect(getByText("How do I invite team members?")).toBeTruthy();
    expect(getByText("How do I change my password?")).toBeTruthy();
  });

  it("shows empty state for non-matching search", () => {
    const { getByPlaceholderText, getByText } = render(<HelpCenterScreen />);
    fireEvent.changeText(getByPlaceholderText("Search help topics..."), "zzzzzzzzz");
    expect(getByText("No results found")).toBeTruthy();
  });

  it("filters FAQ items by search", () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<HelpCenterScreen />);
    fireEvent.changeText(getByPlaceholderText("Search help topics..."), "password");
    expect(getByText("How do I change my password?")).toBeTruthy();
    expect(queryByText("How do I invite team members?")).toBeNull();
  });
});
