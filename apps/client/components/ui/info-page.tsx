import type React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ContactSupport } from "@/components/auth/contact-support";
import { fonts, spacing, useTheme } from "@/styles";

type InfoPageSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function InfoPageSection({ title, children }: InfoPageSectionProps) {
  const { colors: c } = useTheme();

  return (
    <View style={s.section}>
      <Text style={[s.sectionTitle, { color: c.text }]}>{title}</Text>
      <Text style={[s.sectionBody, { color: c.textSecondary }]}>{children}</Text>
    </View>
  );
}

type InfoPageProps = {
  badge: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function InfoPage({ badge, title, subtitle, children }: InfoPageProps) {
  const { colors: c } = useTheme();

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={[s.container, { backgroundColor: c.bg }]}
      contentContainerStyle={s.scrollContent}
    >
      <View style={[s.headerCard, { borderColor: c.border, backgroundColor: c.bgSecondary }]}>
        <Text style={[s.badge, { color: c.primary }]}>{badge}</Text>
        <Text style={[s.title, { color: c.text }]}>{title}</Text>
        {subtitle ? <Text style={[s.subtitle, { color: c.textSecondary }]}>{subtitle}</Text> : null}
      </View>

      <View style={s.body}>{children}</View>

      <View style={s.supportRow}>
        <ContactSupport />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 48,
  },
  headerCard: {
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  badge: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.18 * 11,
  },
  title: {
    marginTop: 8,
    fontSize: 24,
    fontFamily: fonts.bold,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  body: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 15,
    fontFamily: fonts.regular,
    lineHeight: 24,
  },
  supportRow: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
});
