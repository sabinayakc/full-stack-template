import { Body, Container, Head, Hr, Html, Img, Link, Section, Text } from "@react-email/components";

const colors = {
  bg: "#f4f7fb",
  cardBg: "#ffffff",
  border: "#dbe4f0",
  text: "#102033",
  muted: "#5e7085",
  primary: "#2050a0",
  primaryHover: "#173f80",
  secondary: "#f59e0b",
};

export interface OrgContext {
  name?: string;
  logoUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
}

interface LayoutProps {
  preview: string;
  children: React.ReactNode;
  org?: OrgContext;
}

export function Layout({ preview, children, org }: LayoutProps) {
  const orgName = org?.name ?? "App";

  return (
    <Html lang="en">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <table cellPadding="0" cellSpacing="0" role="presentation" style={{ width: "100%" }}>
              <tr>
                <td style={{ padding: "32px 0", textAlign: "center" as const }}>
                  {org?.logoUrl ? (
                    <Img src={org.logoUrl} alt={orgName} width="140" height="48" style={logoImg} />
                  ) : (
                    <Text style={logoText}>{orgName}</Text>
                  )}
                </td>
              </tr>
            </table>
          </Section>

          <Section style={card}>{children}</Section>

          <Section style={footer}>
            <Hr style={divider} />
            <Text style={footerText}>{orgName}</Text>
            {(org?.phone || org?.email || org?.website) && (
              <Text style={footerContactText}>
                {org.phone && <>{org.phone}</>}
                {org.phone && org.email && <> &bull; </>}
                {org.email && (
                  <Link href={`mailto:${org.email}`} style={footerLink}>
                    {org.email}
                  </Link>
                )}
                {(org.phone || org.email) && org.website && <> &bull; </>}
                {org.website && (
                  <Link href={org.website} style={footerLink}>
                    {org.website.replace(/^https?:\/\//, "")}
                  </Link>
                )}
              </Text>
            )}
            <Text style={footerSubText}>
              You received this email because you have an account with {orgName}. If you did not
              request this, you can safely ignore it.
            </Text>
            <Text style={poweredByText}>Powered by App</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export { colors };

const body = {
  backgroundColor: colors.bg,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, Oxygen, Ubuntu, sans-serif',
  margin: "0",
  padding: "0",
};

const container = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "40px 20px",
};

const header = {
  textAlign: "center" as const,
};

const logoImg = {
  margin: "0 auto",
  objectFit: "contain" as const,
};

const logoText = {
  fontSize: "24px",
  fontWeight: "700" as const,
  color: colors.primary,
  margin: "0",
  letterSpacing: "-0.5px",
};

const card = {
  backgroundColor: colors.cardBg,
  borderRadius: "12px",
  border: `1px solid ${colors.border}`,
  padding: "40px 36px",
};

const footer = {
  padding: "24px 0",
};

const divider = {
  borderColor: colors.border,
  margin: "0 0 24px",
};

const footerText = {
  color: colors.muted,
  fontSize: "13px",
  textAlign: "center" as const,
  margin: "0 0 8px",
};

const footerContactText = {
  color: colors.muted,
  fontSize: "12px",
  textAlign: "center" as const,
  lineHeight: "18px",
  margin: "0 0 8px",
};

const footerLink = {
  color: colors.muted,
  textDecoration: "underline",
};

const footerSubText = {
  color: "#71717a",
  fontSize: "12px",
  textAlign: "center" as const,
  lineHeight: "18px",
  margin: "0 0 8px",
};

const poweredByText = {
  color: "#a1a1aa",
  fontSize: "11px",
  textAlign: "center" as const,
  margin: "0",
};
