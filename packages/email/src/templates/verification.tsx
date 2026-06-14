import { Button, Section, Text } from "@react-email/components";
import { colors, Layout, type OrgContext } from "./components/layout";

interface VerificationEmailProps {
  url: string;
  org?: OrgContext;
}

export function VerificationEmail({ url, org }: VerificationEmailProps) {
  return (
    <Layout preview={`Verify your email address for ${org?.name ?? "App"}`} org={org}>
      <Text style={heading}>Verify your email address</Text>
      <Text style={description}>
        Thanks for signing up for App. Click the button below to verify your email address and get
        started.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={url}>
          Verify Email Address
        </Button>
      </Section>

      <Text style={linkFallback}>
        If the button doesn't work, copy and paste this link into your browser:
      </Text>
      <Text style={linkText}>{url}</Text>

      <Text style={expiryText}>
        This link expires in 24 hours. If it has expired, sign in again to request a new
        verification email.
      </Text>
    </Layout>
  );
}

const heading = {
  color: colors.text,
  fontSize: "22px",
  fontWeight: "600" as const,
  margin: "0 0 8px",
  letterSpacing: "-0.3px",
};

const description = {
  color: colors.muted,
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 32px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const button = {
  backgroundColor: colors.primary,
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600" as const,
  borderRadius: "8px",
  padding: "12px 32px",
  textDecoration: "none",
  display: "inline-block",
};

const linkFallback = {
  color: colors.muted,
  fontSize: "13px",
  margin: "0 0 4px",
};

const linkText = {
  color: colors.primary,
  fontSize: "13px",
  wordBreak: "break-all" as const,
  margin: "0 0 24px",
};

const expiryText = {
  color: "#71717a",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0",
};
