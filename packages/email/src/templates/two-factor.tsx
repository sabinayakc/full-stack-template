import { Section, Text } from "@react-email/components";
import { colors, Layout, type OrgContext } from "./components/layout";

interface TwoFactorEmailProps {
  otp: string;
  expiresInMinutes?: number;
  org?: OrgContext;
}

export function TwoFactorEmail({ otp, expiresInMinutes = 5, org }: TwoFactorEmailProps) {
  return (
    <Layout preview={`Your ${org?.name ?? "App"} 2FA code: ${otp}`} org={org}>
      <Section style={iconRow}>
        <Text style={shieldIcon}>&#128274;</Text>
      </Section>

      <Text style={heading}>Two-factor authentication</Text>
      <Text style={description}>
        Enter this code to complete your sign-in. This adds an extra layer of security to your
        account.
      </Text>

      <Section style={codeContainer}>
        <Text style={codeText}>{otp}</Text>
      </Section>

      <Text style={expiryText}>This code expires in {expiresInMinutes} minutes.</Text>
      <Text style={warningText}>
        If you didn't try to sign in, your password may be compromised. Change your password
        immediately and enable additional security measures.
      </Text>
    </Layout>
  );
}

const iconRow = {
  textAlign: "center" as const,
  margin: "0 0 16px",
};

const shieldIcon = {
  fontSize: "32px",
  margin: "0",
};

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

const codeContainer = {
  backgroundColor: colors.bg,
  borderRadius: "8px",
  border: `1px solid ${colors.border}`,
  padding: "20px 0",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const codeText = {
  color: colors.text,
  fontSize: "36px",
  fontWeight: "700" as const,
  letterSpacing: "8px",
  fontFamily: '"Noto Sans Mono", "SF Mono", "Fira Code", monospace',
  margin: "0",
};

const expiryText = {
  color: colors.muted,
  fontSize: "13px",
  margin: "0 0 8px",
};

const warningText = {
  color: "#71717a",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0",
};
