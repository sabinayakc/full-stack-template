import { parseDocument } from "htmlparser2";

const TAG_RE = /<[a-z][\s\S]*>/i;

export function isPlainText(str: string): boolean {
  return !TAG_RE.test(str);
}

interface RenderOptions {
  fontSize?: number;
  color?: string;
  width?: number;
  checkPageBreak?: (needed: number) => void;
}

const FONTS = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
  italic: "Helvetica-Oblique",
  boldItalic: "Helvetica-BoldOblique",
} as const;

function resolveFont(bold: boolean, italic: boolean): string {
  if (bold && italic) return FONTS.boldItalic;
  if (bold) return FONTS.bold;
  if (italic) return FONTS.italic;
  return FONTS.regular;
}

interface InlineContext {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  link: string | null;
}

// htmlparser2 node types - kept minimal since we only read a few fields
interface HtmlNode {
  type: string;
  data?: string;
  tagName?: string;
  children?: HtmlNode[];
  attribs?: Record<string, string>;
}

function isElement(node: HtmlNode): boolean {
  return node.type === "tag" && node.tagName !== undefined;
}

function getTextContent(node: HtmlNode): string {
  if (node.type === "text") return node.data ?? "";
  if (isElement(node) && node.children) {
    return node.children.map(getTextContent).join("");
  }
  return "";
}

function renderInlineNodes(
  doc: PDFKit.PDFDocument,
  children: HtmlNode[],
  ctx: InlineContext,
  opts: RenderOptions,
  continued: boolean,
): void {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const isLast = i === children.length - 1;

    if (child.type === "text") {
      const text = child.data ?? "";
      if (!text) continue;
      doc.font(resolveFont(ctx.bold, ctx.italic));

      const textOpts: Record<string, unknown> = {
        continued: continued || !isLast,
        width: opts.width,
      };

      if (ctx.underline) textOpts.underline = true;
      if (ctx.strike) textOpts.strike = true;
      if (ctx.link) {
        textOpts.link = ctx.link;
        textOpts.underline = true;
      }

      doc.text(text, textOpts);
    } else if (isElement(child) && child.children) {
      const tag = child.tagName!.toLowerCase();
      const nextCtx = { ...ctx };

      if (tag === "strong" || tag === "b") nextCtx.bold = true;
      else if (tag === "em" || tag === "i") nextCtx.italic = true;
      else if (tag === "u") nextCtx.underline = true;
      else if (tag === "s" || tag === "del" || tag === "strike") nextCtx.strike = true;
      else if (tag === "a") nextCtx.link = child.attribs?.href ?? null;
      else if (tag === "code") {
        doc.font("Courier").fontSize(opts.fontSize ?? 9);
        const codeText = getTextContent(child);
        doc.text(codeText, { continued: continued || !isLast, width: opts.width });
        continue;
      } else if (tag === "br") {
        doc.text("", { continued: false });
        continue;
      }

      renderInlineNodes(doc, child.children, nextCtx, opts, continued || !isLast);
    }
  }
}

const DEFAULT_INLINE_CTX: InlineContext = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  link: null,
};

function renderBlockNode(doc: PDFKit.PDFDocument, node: HtmlNode, opts: RenderOptions): void {
  if (node.type === "text") {
    const text = (node.data ?? "").trim();
    if (!text) return;
    doc
      .font(FONTS.regular)
      .fontSize(opts.fontSize ?? 9)
      .fillColor(opts.color ?? "#6b7280");
    doc.text(text, { width: opts.width });
    return;
  }

  if (!isElement(node) || !node.children) return;

  const tag = node.tagName!.toLowerCase();
  const children = node.children;
  const fontSize = opts.fontSize ?? 9;
  const color = opts.color ?? "#6b7280";

  switch (tag) {
    case "p": {
      opts.checkPageBreak?.(fontSize * 2);
      doc.font(FONTS.regular).fontSize(fontSize).fillColor(color);
      renderInlineNodes(doc, children, DEFAULT_INLINE_CTX, opts, false);
      doc.moveDown(0.4);
      break;
    }

    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6": {
      const headingSizes: Record<string, number> = {
        h1: 14,
        h2: 12,
        h3: 11,
        h4: 10,
        h5: 9,
        h6: 9,
      };
      opts.checkPageBreak?.(headingSizes[tag]! * 2);
      doc
        .font(FONTS.bold)
        .fontSize(headingSizes[tag]!)
        .fillColor(opts.color ?? "#1a1a1a");
      doc.text(getTextContent(node), { width: opts.width });
      doc.moveDown(0.3);
      break;
    }

    case "ul": {
      for (const child of children) {
        if (isElement(child) && child.tagName!.toLowerCase() === "li" && child.children) {
          opts.checkPageBreak?.(fontSize * 2);
          const savedX = doc.x;
          doc.font(FONTS.regular).fontSize(fontSize).fillColor(color);
          doc.text("  \u2022  ", { continued: true, width: opts.width });
          renderInlineNodes(doc, child.children, DEFAULT_INLINE_CTX, opts, false);
          doc.x = savedX;
          doc.moveDown(0.2);
        }
      }
      doc.moveDown(0.3);
      break;
    }

    case "ol": {
      let idx = 1;
      for (const child of children) {
        if (isElement(child) && child.tagName!.toLowerCase() === "li" && child.children) {
          opts.checkPageBreak?.(fontSize * 2);
          const savedX = doc.x;
          doc.font(FONTS.regular).fontSize(fontSize).fillColor(color);
          doc.text(`  ${idx}.  `, { continued: true, width: opts.width });
          renderInlineNodes(doc, child.children, DEFAULT_INLINE_CTX, opts, false);
          doc.x = savedX;
          doc.moveDown(0.2);
          idx++;
        }
      }
      doc.moveDown(0.3);
      break;
    }

    case "blockquote": {
      opts.checkPageBreak?.(fontSize * 3);
      const savedX = doc.x;
      const barX = doc.x;
      doc.x = savedX + 14;
      const innerOpts = { ...opts, width: opts.width ? opts.width - 14 : undefined };
      doc.fillColor("#94a3b8");
      for (const child of children) {
        renderBlockNode(doc, child, innerOpts);
      }
      const endY = doc.y;
      doc.save();
      doc.rect(barX, endY - (endY - (doc.y || endY)), 3, endY - savedX).fill("#cbd5e1");
      doc.restore();
      doc.x = savedX;
      doc.fillColor(color);
      doc.moveDown(0.3);
      break;
    }

    case "pre": {
      opts.checkPageBreak?.(fontSize * 3);
      const codeText = getTextContent(node);
      doc
        .font("Courier")
        .fontSize(fontSize - 1)
        .fillColor("#475569");
      doc.text(codeText, { width: opts.width });
      doc.font(FONTS.regular).fillColor(color);
      doc.moveDown(0.4);
      break;
    }

    case "br": {
      doc.moveDown(0.3);
      break;
    }

    default: {
      for (const child of children) {
        renderBlockNode(doc, child, opts);
      }
    }
  }
}

export function renderHtmlBlock(
  doc: PDFKit.PDFDocument,
  html: string,
  opts: RenderOptions = {},
): void {
  if (!html?.trim()) return;

  if (isPlainText(html)) {
    doc
      .font(FONTS.regular)
      .fontSize(opts.fontSize ?? 9)
      .fillColor(opts.color ?? "#6b7280")
      .text(html, { width: opts.width });
    return;
  }

  const dom = parseDocument(html);
  for (const node of dom.children as unknown as HtmlNode[]) {
    renderBlockNode(doc, node, opts);
  }
}
