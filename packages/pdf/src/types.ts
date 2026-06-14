export type PdfProviderId = "pdfkit" | "none";

export interface PdfProviderInfo {
  id: PdfProviderId;
  displayName: string;
  implemented: boolean;
  /** Whether this provider works in Cloudflare Workers */
  workersCompatible: boolean;
}

export interface PdfProviderConfig {
  provider: PdfProviderId;
}

// ─── Generic Document PDF Types ─────────────────────────────────────────────

export interface DocumentPdfData {
  title: string;
  /** Optional HTML or plain-text body rendered into the document. */
  body?: string;
  branding?: {
    organizationName?: string | null;
    primaryColor?: string | null;
    footerText?: string | null;
  };
}
