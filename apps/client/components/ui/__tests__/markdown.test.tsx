import { ThemedMarkdown } from "@/components/ui/markdown";
import { render } from "@/test/utils";

// Mock react-native-markdown-renderer
jest.mock("react-native-markdown-renderer", () => {
  const { Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ children }: { children: string }) => <Text>{children}</Text>,
  };
});

describe("ThemedMarkdown", () => {
  it("renders markdown content", () => {
    const { getByText } = render(<ThemedMarkdown>Hello **world**</ThemedMarkdown>);
    expect(getByText("Hello **world**")).toBeTruthy();
  });

  it("renders without crashing", () => {
    const { toJSON } = render(<ThemedMarkdown>Some text</ThemedMarkdown>);
    expect(toJSON()).toBeTruthy();
  });
});
