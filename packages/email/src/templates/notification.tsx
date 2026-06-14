import { Section, Text } from "@react-email/components";
import { colors, Layout, type OrgContext } from "./components/layout";

interface NotificationEmailProps {
  subject?: string | null;
  body: string;
  org?: OrgContext;
}

const URL_REGEX = /(https?:\/\/[^\s<]+)/g;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderBody(body: string) {
  // Escape, linkify, then split paragraphs on blank lines so multi-line bodies
  // read as proper paragraphs in the rendered email.
  const escaped = escapeHtml(body);
  const linked = escaped.replace(
    URL_REGEX,
    (url) => `<a href="${url}" style="color:${colors.primary};">${url}</a>`,
  );
  const paragraphs = linked.split(/\n{2,}/);
  return paragraphs.map((p) => p.replaceAll("\n", "<br />"));
}

export function NotificationEmail({ subject, body, org }: NotificationEmailProps) {
  const paragraphs = renderBody(body);
  const previewText = subject ?? body.split("\n")[0]?.slice(0, 100) ?? "App notification";

  return (
    <Layout preview={previewText} org={org}>
      {subject ? <Text style={heading}>{subject}</Text> : null}
      <Section>
        {paragraphs.map((html, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: paragraph order is stable
          // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is pre-escaped via escapeHtml() and only linkified URLs are injected
          <Text key={i} style={paragraph} dangerouslySetInnerHTML={{ __html: html }} />
        ))}
      </Section>
    </Layout>
  );
}

const heading = {
  color: colors.text,
  fontSize: "20px",
  fontWeight: "600" as const,
  margin: "0 0 16px",
  letterSpacing: "-0.2px",
};

const paragraph = {
  color: colors.text,
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px",
};
