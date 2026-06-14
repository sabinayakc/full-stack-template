import type { DocumentPdfData, PdfProviderConfig, PdfProviderInfo } from "./types";

export interface PdfProvider {
  readonly info: PdfProviderInfo;
  generateDocument(data: DocumentPdfData): Promise<Buffer>;
}

export abstract class BasePdfProvider implements PdfProvider {
  constructor(protected readonly config: PdfProviderConfig) {}

  abstract readonly info: PdfProviderInfo;
  abstract generateDocument(data: DocumentPdfData): Promise<Buffer>;
}

export class UnsupportedPdfProvider extends BasePdfProvider {
  readonly info: PdfProviderInfo;

  constructor(config: PdfProviderConfig, displayName: string) {
    super(config);
    this.info = {
      id: config.provider,
      displayName,
      implemented: false,
      workersCompatible: false,
    };
  }

  async generateDocument(): Promise<Buffer> {
    throw new Error(`${this.info.displayName} PDF provider is not implemented yet`);
  }
}
