import NotFoundScreen from "@/app/+not-found";
import { render } from "@/test/utils";

jest.mock("@/components/ui/error-screen", () => {
  const { Text } = require("react-native");
  return {
    ErrorScreen: ({ title, subtitle }: { title: string; subtitle: string }) => (
      <>
        <Text>{title}</Text>
        <Text>{subtitle}</Text>
      </>
    ),
  };
});

describe("NotFoundScreen", () => {
  it("renders page not found title", () => {
    const { getByText } = render(<NotFoundScreen />);
    expect(getByText("Page Not Found")).toBeTruthy();
  });

  it("renders explanation subtitle", () => {
    const { getByText } = render(<NotFoundScreen />);
    expect(getByText(/doesn't exist or has been moved/)).toBeTruthy();
  });
});
