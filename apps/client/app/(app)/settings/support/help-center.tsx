import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ContactSupport } from "@/components/auth/contact-support";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { fonts, radius, spacing, useTheme } from "@/styles";

type FaqItem = {
  question: string;
  answer: string;
  category: string;
};

const FAQ_ITEMS: FaqItem[] = [
  // ── Getting Started ─────────────────────────────────────────────────────
  {
    category: "Getting Started",
    question: "How do I invite team members?",
    answer:
      "Go to Settings > Manage Organization and use the invite feature to send email invitations. New members will receive a link to join your organization. You can manage roles and permissions from the same screen.",
  },
  {
    category: "Getting Started",
    question: "Can I switch between organizations?",
    answer:
      "Yes. If you belong to multiple organizations, you can switch between them using the organization selector in the sidebar or by going to Settings > Manage Organization.",
  },

  // ── Notifications ───────────────────────────────────────────────────────
  {
    category: "Notifications",
    question: "Can I control which notifications I receive?",
    answer:
      "Yes. Settings > Notifications lets you toggle push, email, and SMS independently per category.",
  },

  // ── Roles & Permissions ─────────────────────────────────────────────────
  {
    category: "Roles & Permissions",
    question: "How do I change someone's role?",
    answer:
      "Owners and admins go to Settings > Manage Organization, tap the member, and pick a different role. Changes take effect on their next session refresh.",
  },

  // ── Account & Security ─────────────────────────────────────────────────
  {
    category: "Account & Security",
    question: "How do I change my password?",
    answer:
      "Settings > Security > Change Password. Enter your current password, then your new one. You'll stay signed in on this device but other sessions are revoked.",
  },
  {
    category: "Account & Security",
    question: "How do I enable two-factor authentication?",
    answer:
      "Settings > Security > Two-Factor Authentication. Scan the QR with an authenticator app (1Password, Authy, Google Authenticator) and store the backup codes somewhere safe.",
  },
  {
    category: "Account & Security",
    question: "I forgot my password — what now?",
    answer:
      "On the sign-in screen tap Forgot Password. We'll email you a reset link that's valid for one hour. After resetting, you'll be signed out everywhere and need to sign in again.",
  },
  {
    category: "Account & Security",
    question: "Can I sign in on multiple devices?",
    answer:
      "Yes. Settings > Security > Sessions shows everywhere you're signed in. Revoke any device you don't recognize.",
  },

  // ── Data & Privacy ──────────────────────────────────────────────────────
  {
    category: "Data & Privacy",
    question: "How do I delete my account?",
    answer:
      "Go to Settings and scroll to the bottom to find the Delete Account option. We'll show a summary of what will be removed before you confirm. Personal data is removed; organization data shared with other members will be preserved.",
  },
];

function CollapsibleFaqItem({ item }: { item: FaqItem }) {
  const [expanded, setExpanded] = useState(false);
  const { colors: c } = useTheme();

  return (
    <Pressable
      style={[s.faqItem, { borderBottomColor: c.border }]}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={s.faqHeader}>
        <Text style={[s.faqQuestion, { color: c.text }]}>{item.question}</Text>
        <IconSymbol
          name={expanded ? "chevron.up" : "chevron.down"}
          size={14}
          color={c.textSecondary}
        />
      </View>
      {expanded ? (
        <Text style={[s.faqAnswer, { color: c.textSecondary }]}>{item.answer}</Text>
      ) : null}
    </Pressable>
  );
}

export default function HelpCenterScreen() {
  const { colors: c } = useTheme();
  const [search, setSearch] = useState("");

  const filtered = useCallback(() => {
    if (!search.trim()) return FAQ_ITEMS;
    const q = search.toLowerCase();
    return FAQ_ITEMS.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    );
  }, [search]);

  const results = filtered();
  const categories = [...new Set(results.map((item) => item.category))];

  return (
    <View style={[s.container, { backgroundColor: c.bg }]}>
      <View style={[s.searchBar, { backgroundColor: c.bgSecondary, borderColor: c.border }]}>
        <IconSymbol name="magnifyingglass" size={16} color={c.textSecondary} />
        <TextInput
          style={[s.searchInput, { color: c.text }]}
          placeholder="Search help topics..."
          placeholderTextColor={c.textSecondary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 ? (
          <Pressable onPress={() => setSearch("")}>
            <IconSymbol name="xmark.circle.fill" size={16} color={c.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.scrollContent}>
        {results.length === 0 ? (
          <View style={s.emptyState}>
            <IconSymbol name="questionmark.circle" size={40} color={c.textSecondary} />
            <Text style={[s.emptyTitle, { color: c.text }]}>No results found</Text>
            <Text style={[s.emptySubtitle, { color: c.textSecondary }]}>
              Try a different search term or contact support for help.
            </Text>
          </View>
        ) : (
          categories.map((category) => (
            <View key={category} style={s.categorySection}>
              <Text style={[s.categoryTitle, { color: c.primary }]}>{category}</Text>
              <View
                style={[s.categoryCard, { backgroundColor: c.bgSecondary, borderColor: c.border }]}
              >
                {results
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <CollapsibleFaqItem key={item.question} item={item} />
                  ))}
              </View>
            </View>
          ))
        )}

        <View style={s.supportRow}>
          <ContactSupport subject="Help Center Question" />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    height: 42,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
    paddingVertical: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 48,
  },
  categorySection: {
    marginBottom: spacing.xl,
  },
  categoryTitle: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  categoryCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  faqItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.medium,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    textAlign: "center",
  },
  supportRow: {
    marginTop: spacing.xl,
    alignItems: "center",
  },
});
