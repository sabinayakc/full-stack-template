import { Button, Section, Text } from "@react-email/components";
import { colors, Layout, type OrgContext } from "./components/layout";

interface OrganizationInviteEmailProps {
  organizationName: string;
  inviterName: string;
  url: string;
  role: string;
  org?: OrgContext;
}

export function OrganizationInviteEmail({
  organizationName,
  inviterName,
  url,
  role,
  org,
}: OrganizationInviteEmailProps) {
  return (
    <Layout
      preview={`You have been invited to join ${organizationName} on App`}
      org={org ?? { name: organizationName }}
    >
      <Text style={heading}>You've been invited</Text>
      <Text style={description}>
        <strong style={{ color: colors.text }}>{inviterName}</strong> has invited you to join{" "}
        <strong style={{ color: colors.text }}>{organizationName}</strong> on App as a{" "}
        <strong style={{ color: colors.text }}>{role}</strong>.
      </Text>

      <Section style={orgCard}>
        <Text style={orgName}>{organizationName}</Text>
        <Text style={orgRole}>Role: {role}</Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={url}>
          Accept Invitation
        </Button>
      </Section>

      <Text style={expiryText}>
        This invitation expires in 7 days. If you do not have a App account, you'll be able to
        create one when you accept.
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
  margin: "0 0 24px",
};

const orgCard = {
  backgroundColor: colors.bg,
  borderRadius: "8px",
  border: `1px solid ${colors.border}`,
  padding: "20px 24px",
  margin: "0 0 24px",
};

const orgName = {
  color: colors.text,
  fontSize: "16px",
  fontWeight: "600" as const,
  margin: "0 0 4px",
};

const orgRole = {
  color: colors.muted,
  fontSize: "13px",
  margin: "0",
  textTransform: "capitalize" as const,
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

const expiryText = {
  color: "#71717a",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0",
};
