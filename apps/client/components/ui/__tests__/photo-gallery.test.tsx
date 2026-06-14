import { type GalleryItem, PhotoGallery } from "@/components/ui/photo-gallery";
import { render } from "@/test/utils";

// Mock DocViewer to avoid its heavy dependencies
jest.mock("@/components/ui/doc-viewer", () => ({
  DocViewer: () => null,
}));

// Mock expo-image
jest.mock("expo-image", () => {
  const { View } = require("react-native");
  return {
    Image: (props: Record<string, unknown>) =>
      require("react").createElement(View, { testID: props.testID }),
  };
});

describe("PhotoGallery", () => {
  const makeItems = (): GalleryItem[] => [
    { id: "1", url: "https://example.com/a.jpg", name: "Photo A", mimeType: "image/jpeg" },
    { id: "2", url: "https://example.com/b.pdf", name: "Doc B", mimeType: "application/pdf" },
  ];

  it("renders empty text when no items", () => {
    const { getByText } = render(<PhotoGallery items={[]} />);
    expect(getByText("No items yet.")).toBeTruthy();
  });

  it("renders custom empty text", () => {
    const { getByText } = render(<PhotoGallery items={[]} emptyText="No photos" />);
    expect(getByText("No photos")).toBeTruthy();
  });

  it("renders item names", () => {
    const { getByText } = render(<PhotoGallery items={makeItems()} />);
    expect(getByText("Photo A")).toBeTruthy();
    expect(getByText("Doc B")).toBeTruthy();
  });

  it("renders browse hint when multiple items", () => {
    const { getByText } = render(<PhotoGallery items={makeItems()} />);
    expect(getByText("Browse")).toBeTruthy();
  });

  it("does not render browse hint for single item", () => {
    const { queryByText } = render(<PhotoGallery items={[makeItems()[0]]} />);
    expect(queryByText("Browse")).toBeNull();
  });

  it("renders badge when item has one", () => {
    const items: GalleryItem[] = [
      {
        id: "1",
        url: "https://example.com/a.jpg",
        name: "Photo",
        mimeType: "image/jpeg",
        badge: "NEW",
      },
    ];
    const { getByText } = render(<PhotoGallery items={items} />);
    expect(getByText("NEW")).toBeTruthy();
  });
});
