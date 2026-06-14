import { BasePdfProvider, type PdfProvider } from "./provider";
import { PdfKitProvider } from "./providers/pdfkit";
import type { DocumentPdfData, PdfProviderConfig, PdfProviderInfo } from "./types";

class NoopPdfProvider extends BasePdfProvider {
  readonly info: PdfProviderInfo = {
    id: "none",
    displayName: "Disabled",
    implemented: true,
    workersCompatible: true,
  };

  async generateDocument(_data: DocumentPdfData): Promise<Buffer> {
    throw new Error("PDF generation is disabled");
  }
}

export function createPdfProvider(config: PdfProviderConfig): PdfProvider {
  switch (config.provider) {
    case "pdfkit":
      return new PdfKitProvider(config);
    case "none":
      return new NoopPdfProvider(config);
    default:
      throw new Error(`Unknown PDF provider: ${(config as { provider: string }).provider}`);
  }
}
