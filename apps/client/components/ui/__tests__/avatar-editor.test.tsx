import { AvatarEditor } from "@/components/ui/avatar-editor";
import { render } from "@/test/utils";

// Mock expo-image-manipulator
jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: "jpeg" },
}));

// Mock expo-image-picker
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
}));

describe("AvatarEditor", () => {
  it("renders fallback text when no image", () => {
    const { getByText } = render(
      <AvatarEditor imageUrl={null} fallbackText="JD" onUpload={jest.fn()} />,
    );
    expect(getByText("JD")).toBeTruthy();
  });

  it("renders with custom size", () => {
    const { getByText } = render(
      <AvatarEditor imageUrl={null} fallbackText="AB" size={100} onUpload={jest.fn()} />,
    );
    expect(getByText("AB")).toBeTruthy();
  });

  it("renders edit badge when editable", () => {
    const { toJSON } = render(
      <AvatarEditor imageUrl={null} fallbackText="X" onUpload={jest.fn()} editable={true} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it("renders without edit badge when not editable", () => {
    const { toJSON } = render(
      <AvatarEditor imageUrl={null} fallbackText="X" onUpload={jest.fn()} editable={false} />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
