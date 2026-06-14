import PrivacyPolicyScreen from "@/app/(app)/settings/support/privacy";
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

describe("PrivacyPolicyScreen (settings)", () => {
  it("renders privacy policy title", () => {
    const { getByText } = render(<PrivacyPolicyScreen />);
    expect(getByText("Privacy Policy")).toBeTruthy();
  });

  it("renders first and last section", () => {
    const { getByText } = render(<PrivacyPolicyScreen />);
    expect(getByText("1. Information We Collect")).toBeTruthy();
    expect(getByText("7. Contact Us")).toBeTruthy();
  });
});
