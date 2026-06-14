import { Button, Section, Text } from "@react-email/components";
import { colors, Layout, type OrgContext } from "./components/layout";

interface ResetPasswordEmailProps {
  url: string;
  org?: OrgContext;
}

export function ResetPasswordEmail({ url, org }: ResetPasswordEmailProps) {
  return (
    <Layout preview={`Reset your ${org?.name ?? "App"} password`} org={org}>
      <Text style={heading}>Reset your password</Text>
      <Text style={description}>
        We received a request to reset the password for your App account. Click the button below to
        choose a new password.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={url}>
          Reset Password
        </Button>
      </Section>

      <Text style={linkFallback}>
        If the button doesn't work, copy and paste this link into your browser:
      </Text>
      <Text style={linkText}>{url}</Text>

      <Text style={expiryText}>
        This link expires in 1 hour. If you didn't request a password reset, you can safely ignore
        this email — your password will remain unchanged.
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
