import TermsOfServiceScreen from "@/app/(app)/settings/support/terms";
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
    InfoPageSection: ({ title }: { title: string }) => {
      const { Text: T } = require("react-native");
      return <T>{title}</T>;
    },
  };
});

describe("TermsOfServiceScreen (settings)", () => {
  it("renders terms of service title", () => {
    const { getByText } = render(<TermsOfServiceScreen />);
    expect(getByText("Terms of Service")).toBeTruthy();
  });

  it("renders first and last section", () => {
    const { getByText } = render(<TermsOfServiceScreen />);
    expect(getByText("1. Acceptance of Terms")).toBeTruthy();
    expect(getByText("8. Changes to Terms")).toBeTruthy();
  });
});
