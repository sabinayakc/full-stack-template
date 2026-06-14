import { Section, Text } from "@react-email/components";
import { colors, Layout } from "./components/layout";

type OTPType = "sign-in" | "email-verification" | "forget-password";

interface OTPEmailProps {
  otp: string;
  type: OTPType;
  expiresInMinutes?: number;
}

const typeConfig: Record<OTPType, { heading: string; description: string }> = {
  "sign-in": {
    heading: "Sign in to App",
    description: "Use the code below to complete your sign-in.",
  },
  "email-verification": {
    heading: "Verify your email",
    description: "Use the code below to verify your email address.",
  },
  "forget-password": {
    heading: "Reset your password",
    description: "Use the code below to reset your password.",
  },
};

export function OTPEmail({ otp, type, expiresInMinutes = 5 }: OTPEmailProps) {
  const config = typeConfig[type];

  return (
    <Layout preview={`Your App code: ${otp}`}>
      <Text style={heading}>{config.heading}</Text>
      <Text style={description}>{config.description}</Text>

      <Section style={codeContainer}>
        <Text style={codeText}>{otp}</Text>
      </Section>

      <Text style={expiryText}>This code expires in {expiresInMinutes} minutes.</Text>
      <Text style={warningText}>
        If you didn't request this code, someone may be trying to access your account. Do not share
        this code with anyone.
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
