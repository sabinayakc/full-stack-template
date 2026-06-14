import { DocViewer } from "@/components/ui/doc-viewer";
import { render } from "@/test/utils";

// Mock AppModal
jest.mock("@/components/ui/app-modal", () => {
  return {
    AppModal: ({ children, visible }: { children: React.ReactNode; visible: boolean }) =>
      visible ? children : null,
  };
});

// Mock expo-image
jest.mock("expo-image", () => {
  const { View } = require("react-native");
  return {
    Image: (props: Record<string, unknown>) =>
      require("react").createElement(View, { testID: "expo-image" }),
  };
});

// Mock react-native-webview
jest.mock("react-native-webview", () => {
  const { View } = require("react-native");
  return {
    WebView: (props: Record<string, unknown>) =>
      require("react").createElement(View, { testID: "webview" }),
  };
});

// Mock expo-file-system
jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "/tmp/",
  downloadAsync: jest.fn(),
}));

// Mock expo-sharing
jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn(),
}));

describe("DocViewer", () => {
  it("renders nothing when not visible", () => {
    const { toJSON } = render(<DocViewer visible={false} onClose={jest.fn()} url="" name="" />);
    expect(toJSON()).toBeNull();
  });

  it("renders header with file name", () => {
    const { getByText } = render(
      <DocViewer
        visible={true}
        onClose={jest.fn()}
        url="https://example.com/doc.pdf"
        name="Report.pdf"
        mimeType="application/pdf"
      />,
    );
    expect(getByText("Report.pdf")).toBeTruthy();
  });

  it("shows unsupported message for unknown mime types", () => {
    const { getByText } = render(
      <DocViewer
        visible={true}
        onClose={jest.fn()}
        url="https://example.com/file.xyz"
        name="data.xyz"
        mimeType="application/octet-stream"
      />,
    );
    expect(getByText("Preview not available for this file type.")).toBeTruthy();
    expect(getByText("Save to Device")).toBeTruthy();
  });

  it("shows mime type for unsupported files", () => {
    const { getByText } = render(
      <DocViewer
        visible={true}
        onClose={jest.fn()}
        url="https://example.com/file.xyz"
        name="data.xyz"
        mimeType="application/octet-stream"
      />,
    );
    expect(getByText("application/octet-stream")).toBeTruthy();
  });
});
