import TermsScreen from "@/app/(public)/terms";
import { render } from "@/test/utils";

jest.mock("@/components/ui/info-page", () => {
  const { Text, View } = require("react-native");
  return {
    InfoPage: ({ title, children }: { title: string; children: React.ReactNode }) => (
      <View>
        <Text>{title}</Text>
        {children}
      </View>
    ),
    InfoPageSection: ({ title, children }: { title: string; children: React.ReactNode }) => (
      <View>
        <Text>{title}</Text>
        <Text>{children}</Text>
      </View>
    ),
  };
});

describe("TermsScreen (public)", () => {
  it("renders terms of service title", () => {
    const { getByText } = render(<TermsScreen />);
    expect(getByText("Terms of Service")).toBeTruthy();
  });

  it("renders all 8 sections", () => {
    const { getByText } = render(<TermsScreen />);
    expect(getByText("1. Acceptance of Terms")).toBeTruthy();
    expect(getByText("8. Changes to Terms")).toBeTruthy();
  });
});
