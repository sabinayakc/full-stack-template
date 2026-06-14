import { PdfViewerScreen } from "@/components/ui/pdf-viewer-screen";
import { fireEvent, render } from "@/test/utils";

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
}));

// Mock PdfViewerContent
jest.mock("@/components/ui/pdf-viewer-content", () => ({
  PdfViewerContent: () => null,
}));

describe("PdfViewerScreen", () => {
  beforeEach(() => mockBack.mockClear());

  it("renders title and subtitle", () => {
    const { getByText } = render(
      <PdfViewerScreen title="Invoice #123" url="https://example.com/doc.pdf" isLoading={false} />,
    );
    expect(getByText("Invoice #123")).toBeTruthy();
    expect(getByText("PDF")).toBeTruthy();
  });

  it("renders custom subtitle", () => {
    const { getByText } = render(
      <PdfViewerScreen
        title="Estimate"
        subtitle="Draft"
        url="https://example.com/doc.pdf"
        isLoading={false}
      />,
    );
    expect(getByText("Draft")).toBeTruthy();
  });

  it("shows loading indicator", () => {
    const { toJSON } = render(<PdfViewerScreen title="Doc" url={null} isLoading={true} />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain("ActivityIndicator");
  });

  it("shows empty state when no URL and not loading", () => {
    const { getByText } = render(<PdfViewerScreen title="Doc" url={null} isLoading={false} />);
    expect(getByText("Not available")).toBeTruthy();
    expect(getByText("PDF not available.")).toBeTruthy();
  });

  it("shows custom empty message", () => {
    const { getByText } = render(
      <PdfViewerScreen title="Doc" url={null} isLoading={false} emptyMessage="Nothing to show." />,
    );
    expect(getByText("Nothing to show.")).toBeTruthy();
  });

  it("navigates back on back button press", () => {
    const { getByTestId } = render(
      <PdfViewerScreen title="Doc" url="https://example.com/doc.pdf" isLoading={false} />,
    );
    fireEvent.press(getByTestId("pdf-viewer-back"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("renders external link button when URL present", () => {
    const { getByTestId } = render(
      <PdfViewerScreen title="Doc" url="https://example.com/doc.pdf" isLoading={false} />,
    );
    expect(getByTestId("pdf-viewer-open-external")).toBeTruthy();
  });
});
