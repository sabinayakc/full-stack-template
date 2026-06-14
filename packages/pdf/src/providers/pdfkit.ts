import PDFDocument from "pdfkit";
import { renderHtmlBlock } from "../html-renderer";
import { BasePdfProvider } from "../provider";
import type { DocumentPdfData, PdfProviderInfo } from "../types";

const COLORS = {
  primary: "#0a7ea4",
  dark: "#1a1a1a",
  muted: "#6b7280",
} as const;

export class PdfKitProvider extends BasePdfProvider {
  readonly info: PdfProviderInfo = {
    id: "pdfkit",
    displayName: "PDFKit",
    implemented: true,
    // PDFKit relies on Node built-ins; run it in a Node-compatible context.
    workersCompatible: false,
  };

  async generateDocument(data: DocumentPdfData): Promise<Buffer> {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    const done = new Promise<Buffer>((resolve, reject) => {
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    const primary = data.branding?.primaryColor || COLORS.primary;

    if (data.branding?.organizationName) {
      doc.fontSize(10).fillColor(COLORS.muted).text(data.branding.organizationName);
      doc.moveDown(0.5);
    }

    doc.fontSize(20).fillColor(primary).text(data.title);
    doc.moveDown(1);

    if (data.body) {
      renderHtmlBlock(doc, data.body, { color: COLORS.dark, fontSize: 11, width: 495 });
    }

    if (data.branding?.footerText) {
      doc.moveDown(2);
      doc.fontSize(8).fillColor(COLORS.muted).text(data.branding.footerText);
    }

    doc.end();
    return done;
  }
}
