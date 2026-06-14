import { RichTextViewer } from "@/components/ui/rich-text-viewer";
import { render } from "@/test/utils";

describe("RichTextViewer", () => {
  it("renders plain text as-is", () => {
    const { getByText } = render(<RichTextViewer html="Hello world" />);
    expect(getByText("Hello world")).toBeTruthy();
  });

  it("strips HTML tags and shows plain text", () => {
    const { getByText } = render(<RichTextViewer html="<p>Hello <strong>bold</strong></p>" />);
    expect(getByText("Hello bold")).toBeTruthy();
  });

  it("decodes common HTML entities", () => {
    const { getByText } = render(<RichTextViewer html="5 &gt; 3 &amp; 2 &lt; 4" />);
    expect(getByText("5 > 3 & 2 < 4")).toBeTruthy();
  });

  it("shows placeholder when html is empty", () => {
    const { getByText } = render(<RichTextViewer html="" />);
    expect(getByText("No content")).toBeTruthy();
  });

  it("shows placeholder when html is only tags", () => {
    const { getByText } = render(<RichTextViewer html="<p></p>" />);
    expect(getByText("No content")).toBeTruthy();
  });

  it("converts br and closing tags to newlines", () => {
    const { getByText } = render(<RichTextViewer html="Line one<br/>Line two" />);
    expect(getByText(/Line one/)).toBeTruthy();
    expect(getByText(/Line two/)).toBeTruthy();
  });
});
