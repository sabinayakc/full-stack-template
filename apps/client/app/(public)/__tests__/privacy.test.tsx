import PrivacyScreen from "@/app/(public)/privacy";
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

describe("PrivacyScreen (public)", () => {
  it("renders privacy policy title", () => {
    const { getByText } = render(<PrivacyScreen />);
    expect(getByText("Privacy Policy")).toBeTruthy();
  });

  it("renders all 7 sections", () => {
    const { getByText } = render(<PrivacyScreen />);
    expect(getByText("1. Information We Collect")).toBeTruthy();
    expect(getByText("7. Contact Us")).toBeTruthy();
  });
});
