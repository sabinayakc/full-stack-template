import { UploadActionSheet } from "@/components/ui/upload-action-sheet";
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
      require("react").createElement(View, { testID: props.testID }),
  };
});

// Mock useFilePicker
jest.mock("@/hooks/use-file-picker", () => ({
  useFilePicker: () => ({
    pickImages: jest.fn().mockResolvedValue([]),
    takePhoto: jest.fn().mockResolvedValue([]),
    pickDocuments: jest.fn().mockResolvedValue([]),
  }),
}));

describe("UploadActionSheet", () => {
  const baseProps = {
    visible: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
  };

  it("renders nothing when not visible", () => {
    const { toJSON } = render(<UploadActionSheet {...baseProps} visible={false} />);
    expect(toJSON()).toBeNull();
  });

  it("renders title and picker options when visible", () => {
    const { getByText } = render(<UploadActionSheet {...baseProps} />);
    expect(getByText("Add Attachments")).toBeTruthy();
    expect(getByText("Take Photo")).toBeTruthy();
    expect(getByText("Choose Photos")).toBeTruthy();
    expect(getByText("Choose Documents")).toBeTruthy();
  });

  it("renders cancel button", () => {
    const { getByText } = render(<UploadActionSheet {...baseProps} />);
    expect(getByText("Cancel")).toBeTruthy();
  });

  it("shows uploading state", () => {
    const { getByText } = render(<UploadActionSheet {...baseProps} isUploading={true} />);
    expect(getByText("Uploading...")).toBeTruthy();
  });

  it("shows upload progress", () => {
    const { getByText } = render(
      <UploadActionSheet {...baseProps} isUploading={true} uploadCompleted={2} uploadTotal={5} />,
    );
    expect(getByText("Uploading 2 of 5...")).toBeTruthy();
  });
});
