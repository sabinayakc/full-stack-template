import { describe, expect, it, vi } from "vitest";
import { isPlainText, renderHtmlBlock } from "../html-renderer";

function mockDoc() {
  const calls: { method: string; args: unknown[] }[] = [];
  const doc: Record<string, unknown> = { x: 72, y: 100 };

  for (const method of [
    "font",
    "fontSize",
    "fillColor",
    "moveDown",
    "save",
    "restore",
    "rect",
    "fill",
  ]) {
    doc[method] = vi.fn((...args: unknown[]) => {
      calls.push({ method, args });
      return doc;
    });
  }

  doc.text = vi.fn((...args: unknown[]) => {
    calls.push({ method: "text", args });
    return doc;
  });

  return { doc: doc as unknown as PDFKit.PDFDocument, calls };
}

describe("isPlainText", () => {
  it("returns true for plain text", () => {
    expect(isPlainText("Hello world")).toBe(true);
  });

  it("returns true for empty string", () => {
    expect(isPlainText("")).toBe(true);
  });

  it("returns false for HTML with tags", () => {
    expect(isPlainText("<p>Hello</p>")).toBe(false);
  });

  it("returns false for inline tags", () => {
    expect(isPlainText("Hello <strong>world</strong>")).toBe(false);
  });

  it("returns true for text with angle brackets that are not tags", () => {
    expect(isPlainText("5 > 3 and 2 < 4")).toBe(true);
  });
});

describe("renderHtmlBlock", () => {
  it("does nothing for empty input", () => {
    const { doc, calls } = mockDoc();
    renderHtmlBlock(doc, "");
    expect(calls).toHaveLength(0);
  });

  it("does nothing for whitespace-only input", () => {
    const { doc, calls } = mockDoc();
    renderHtmlBlock(doc, "   ");
    expect(calls).toHaveLength(0);
  });

  it("renders plain text as a simple text call", () => {
    const { doc } = mockDoc();
    renderHtmlBlock(doc, "Hello world");
    expect(doc.font).toHaveBeenCalledWith("Helvetica");
    expect(doc.text).toHaveBeenCalledWith("Hello world", { width: undefined });
  });

  it("renders a paragraph", () => {
    const { doc } = mockDoc();
    renderHtmlBlock(doc, "<p>Hello world</p>");
    expect(doc.font).toHaveBeenCalledWith("Helvetica");
    expect(doc.text).toHaveBeenCalled();
    expect(doc.moveDown).toHaveBeenCalled();
  });

  it("renders bold text with Helvetica-Bold", () => {
    const { doc, calls } = mockDoc();
    renderHtmlBlock(doc, "<p><strong>Bold text</strong></p>");
    const fontCalls = calls.filter((c) => c.method === "font");
    expect(fontCalls.some((c) => c.args[0] === "Helvetica-Bold")).toBe(true);
  });

  it("renders italic text with Helvetica-Oblique", () => {
    const { doc, calls } = mockDoc();
    renderHtmlBlock(doc, "<p><em>Italic text</em></p>");
    const fontCalls = calls.filter((c) => c.method === "font");
    expect(fontCalls.some((c) => c.args[0] === "Helvetica-Oblique")).toBe(true);
  });

  it("renders bold-italic with Helvetica-BoldOblique", () => {
    const { doc, calls } = mockDoc();
    renderHtmlBlock(doc, "<p><strong><em>Bold italic</em></strong></p>");
    const fontCalls = calls.filter((c) => c.method === "font");
    expect(fontCalls.some((c) => c.args[0] === "Helvetica-BoldOblique")).toBe(true);
  });

  it("renders headings with bold font", () => {
    const { doc } = mockDoc();
    renderHtmlBlock(doc, "<h2>Section Title</h2>");
    expect(doc.font).toHaveBeenCalledWith("Helvetica-Bold");
    expect(doc.fontSize).toHaveBeenCalledWith(12);
    expect(doc.text).toHaveBeenCalledWith("Section Title", { width: undefined });
  });

  it("renders unordered list with bullet markers", () => {
    const { doc, calls } = mockDoc();
    renderHtmlBlock(doc, "<ul><li>First</li><li>Second</li></ul>");
    const textCalls = calls.filter((c) => c.method === "text");
    const bulletCalls = textCalls.filter(
      (c) => typeof c.args[0] === "string" && c.args[0].includes("\u2022"),
    );
    expect(bulletCalls).toHaveLength(2);
  });

  it("renders ordered list with number markers", () => {
    const { doc, calls } = mockDoc();
    renderHtmlBlock(doc, "<ol><li>First</li><li>Second</li></ol>");
    const textCalls = calls.filter((c) => c.method === "text");
    const numCalls = textCalls.filter(
      (c) => typeof c.args[0] === "string" && /^\s+\d+\.\s+$/.test(c.args[0] as string),
    );
    expect(numCalls).toHaveLength(2);
  });

  it("uses custom fontSize and color options", () => {
    const { doc } = mockDoc();
    renderHtmlBlock(doc, "Plain text", { fontSize: 12, color: "#000000" });
    expect(doc.fontSize).toHaveBeenCalledWith(12);
    expect(doc.fillColor).toHaveBeenCalledWith("#000000");
  });

  it("passes width option through", () => {
    const { doc } = mockDoc();
    renderHtmlBlock(doc, "Plain text", { width: 400 });
    expect(doc.text).toHaveBeenCalledWith("Plain text", { width: 400 });
  });

  it("calls checkPageBreak for paragraphs", () => {
    const { doc } = mockDoc();
    const checkPageBreak = vi.fn();
    renderHtmlBlock(doc, "<p>Content</p>", { checkPageBreak });
    expect(checkPageBreak).toHaveBeenCalled();
  });

  it("handles mixed inline formatting", () => {
    const { doc, calls } = mockDoc();
    renderHtmlBlock(doc, "<p>Normal <strong>bold</strong> <em>italic</em></p>");
    const fontCalls = calls.filter((c) => c.method === "font");
    const fonts = fontCalls.map((c) => c.args[0]);
    expect(fonts).toContain("Helvetica");
    expect(fonts).toContain("Helvetica-Bold");
    expect(fonts).toContain("Helvetica-Oblique");
  });

  it("handles <b> and <i> aliases", () => {
    const { doc, calls } = mockDoc();
    renderHtmlBlock(doc, "<p><b>bold</b> <i>italic</i></p>");
    const fontCalls = calls.filter((c) => c.method === "font");
    const fonts = fontCalls.map((c) => c.args[0]);
    expect(fonts).toContain("Helvetica-Bold");
    expect(fonts).toContain("Helvetica-Oblique");
  });

  it("renders underline text with underline option", () => {
    const { doc, calls } = mockDoc();
    renderHtmlBlock(doc, "<p><u>underlined</u></p>");
    const textCalls = calls.filter((c) => c.method === "text");
    expect(textCalls.some((c) => (c.args[1] as Record<string, unknown>)?.underline === true)).toBe(
      true,
    );
  });

  it("renders strikethrough text with strike option", () => {
    const { doc, calls } = mockDoc();
    renderHtmlBlock(doc, "<p><s>deleted</s></p>");
    const textCalls = calls.filter((c) => c.method === "text");
    expect(textCalls.some((c) => (c.args[1] as Record<string, unknown>)?.strike === true)).toBe(
      true,
    );
  });

  it("renders <del> as strikethrough", () => {
    const { doc, calls } = mockDoc();
    renderHtmlBlock(doc, "<p><del>removed</del></p>");
    const textCalls = calls.filter((c) => c.method === "text");
    expect(textCalls.some((c) => (c.args[1] as Record<string, unknown>)?.strike === true)).toBe(
      true,
    );
  });

  it("renders links with href and underline", () => {
    const { doc, calls } = mockDoc();
    renderHtmlBlock(doc, '<p><a href="https://example.com">click</a></p>');
    const textCalls = calls.filter((c) => c.method === "text");
    expect(
      textCalls.some((c) => (c.args[1] as Record<string, unknown>)?.link === "https://example.com"),
    ).toBe(true);
  });

  it("renders inline code with Courier font", () => {
    const { doc } = mockDoc();
    renderHtmlBlock(doc, "<p><code>const x = 1</code></p>");
    expect(doc.font).toHaveBeenCalledWith("Courier");
  });

  it("renders code blocks with Courier font", () => {
    const { doc } = mockDoc();
    renderHtmlBlock(doc, "<pre><code>function hello() {}</code></pre>");
    expect(doc.font).toHaveBeenCalledWith("Courier");
  });

  it("renders blockquote with indentation", () => {
    const { doc, calls } = mockDoc();
    renderHtmlBlock(doc, "<blockquote><p>Quoted text</p></blockquote>");
    expect(calls.some((c) => c.method === "text")).toBe(true);
    expect(doc.moveDown).toHaveBeenCalled();
  });

  it("renders different heading sizes", () => {
    const { doc } = mockDoc();
    renderHtmlBlock(doc, "<h1>Big</h1>");
    expect(doc.fontSize).toHaveBeenCalledWith(14);

    renderHtmlBlock(doc, "<h3>Small</h3>");
    expect(doc.fontSize).toHaveBeenCalledWith(11);
  });
});
