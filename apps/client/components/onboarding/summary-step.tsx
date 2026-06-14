import { StyleSheet, Text, View } from "react-native";
import { fonts, radius, useTheme } from "@/styles";
import type { OnboardingState } from "./onboarding-state";
import { COMPANY_SIZE_OPTIONS } from "./onboarding-state";

interface Props {
  state: OnboardingState;
}

function SummaryCard({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors: c } = useTheme();

  return (
    <View style={[s.card, { borderColor: c.border, backgroundColor: c.bg }]}>
      <Text style={[s.cardTitle, { color: c.textSecondary }]}>{title}</Text>
      {children}
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  const { colors: c } = useTheme();

  if (!value) return null;
  return (
    <View style={s.row}>
      <Text style={[s.rowLabel, { color: c.textSecondary }]}>{label}</Text>
      <Text style={[s.rowValue, { color: c.text }]}>{value}</Text>
    </View>
  );
}

export function SummaryStep({ state }: Props) {
  const org = state.organization;
  const prefs = state.userPreferences;
  const { colors: c } = useTheme();
  const sizeLabel = COMPANY_SIZE_OPTIONS.find((o) => o.value === org.companySize)?.label;

  return (
    <View style={s.container}>
      <SummaryCard title="Organization">
        <SummaryRow label="Name" value={org.name} />
        <SummaryRow label="Slug" value={org.slug} />
        <SummaryRow label="Company Size" value={sizeLabel} />
        <SummaryRow label="Phone" value={org.phone} />
      </SummaryCard>

      <SummaryCard title="Your Preferences">
        <SummaryRow label="Job Title" value={prefs.jobTitle} />
      </SummaryCard>

      {state.invitations.length > 0 ? (
        <SummaryCard title={`Team Invitations (${state.invitations.length})`}>
          {state.invitations.map((inv) => (
            <View key={inv.email} style={s.row}>
              <Text style={[s.rowLabel, { color: c.textSecondary }]}>{inv.email}</Text>
              <Text style={[s.invRole, { color: c.primary }]}>{inv.role}</Text>
            </View>
          ))}
        </SummaryCard>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    gap: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardTitle: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  rowValue: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  invRole: {
    fontSize: 12,
    fontFamily: fonts.medium,
    textTransform: "capitalize",
  },
});
