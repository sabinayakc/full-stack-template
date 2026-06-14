import { ExternalLink } from "@/components/core/external-link";
import { render } from "@/test/utils";

jest.mock("expo-web-browser", () => ({
  openBrowserAsync: jest.fn(),
  WebBrowserPresentationStyle: { AUTOMATIC: 0 },
}));

describe("ExternalLink", () => {
  it("renders children", () => {
    const { getByText } = render(<ExternalLink href="https://example.com">Visit</ExternalLink>);
    expect(getByText("Visit")).toBeTruthy();
  });
});
