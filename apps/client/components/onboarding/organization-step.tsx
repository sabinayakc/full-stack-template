import type { CompanySize } from "@repo/shared";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { PhoneInput } from "@/components/ui/phone-input";
import { fonts, radius, useTheme } from "@/styles";
import type { OnboardingState } from "./onboarding-state";
import { COMPANY_SIZE_OPTIONS } from "./onboarding-state";

interface Props {
  state: OnboardingState;
  onChange: (state: OnboardingState) => void;
  errors?: {
    name?: string;
    slug?: string;
  };
}

export function OrganizationStep({ state, onChange, errors }: Props) {
  const org = state.organization;
  const [slugEdited, setSlugEdited] = useState(false);
  const { colors: c } = useTheme();

  const updateOrg = useCallback(
    (partial: Partial<typeof org>) => {
      onChange({
        ...state,
        organization: { ...org, ...partial },
      });
    },
    [state, org, onChange],
  );

  const handleNameChange = useCallback(
    (text: string) => {
      const updates: Partial<typeof org> = { name: text };
      if (!slugEdited) {
        updates.slug = text
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }
      updateOrg(updates);
    },
    [slugEdited, updateOrg],
  );

  return (
    <View style={s.sectionGap}>
      {/* Organization Name */}
      <View style={s.fieldGap}>
        <Text style={[s.label, { color: c.text }]}>Company Name</Text>
        <TextInput
          testID="onboarding-org-name"
          style={[
            s.input,
            {
              backgroundColor: c.bg,
              color: c.text,
              borderColor: errors?.name ? c.danger : c.border,
            },
          ]}
          placeholder="Acme Inc"
          placeholderTextColor={c.textSecondary}
          value={org.name}
          onChangeText={handleNameChange}
          autoCapitalize="words"
        />
        {errors?.name ? (
          <Text style={[s.errorText, { color: c.danger }]}>{errors.name}</Text>
        ) : null}
      </View>

      {/* Slug */}
      <View style={s.fieldGap}>
        <Text style={[s.label, { color: c.text }]}>URL Slug</Text>
        <TextInput
          testID="onboarding-org-slug"
          style={[
            s.input,
            {
              backgroundColor: c.bg,
              color: c.text,
              borderColor: errors?.slug ? c.danger : c.border,
            },
          ]}
          placeholder="acme-inc"
          placeholderTextColor={c.textSecondary}
          value={org.slug}
          onChangeText={(text) => {
            setSlugEdited(true);
            updateOrg({ slug: text.toLowerCase().replace(/[^a-z0-9-]/g, "") });
          }}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {errors?.slug ? (
          <Text style={[s.errorText, { color: c.danger }]}>{errors.slug}</Text>
        ) : null}
      </View>

      {/* Company Size */}
      <View style={s.optionSectionGap}>
        <Text style={[s.label, { color: c.text }]}>Company Size</Text>
        <View style={s.chipRow}>
          {COMPANY_SIZE_OPTIONS.map((opt) => {
            const selected = org.companySize === opt.value;
            return (
              <Pressable
                key={opt.value}
                testID={`onboarding-size-${opt.value}`}
                style={[
                  s.chipLarge,
                  {
                    borderColor: selected ? c.primary : c.border,
                    backgroundColor: selected ? c.bgSecondary : c.bg,
                  },
                ]}
                onPress={() => updateOrg({ companySize: opt.value as CompanySize })}
              >
                <Text style={[s.chipLabelBold, { color: selected ? c.primary : c.text }]}>
                  {opt.label}
                </Text>
                <Text style={[s.chipDesc, { color: c.textSecondary }]}>{opt.desc}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Phone */}
      <View style={s.fieldGap}>
        <Text style={[s.label, { color: c.text }]}>Phone (optional)</Text>
        <PhoneInput
          value={org.phone ?? ""}
          onChangeText={(formatted) => updateOrg({ phone: formatted })}
          style={{ backgroundColor: c.bg, borderColor: c.border }}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  sectionGap: {
    gap: 20,
  },
  fieldGap: {
    gap: 6,
  },
  optionSectionGap: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  input: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  errorText: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipLarge: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chipSmall: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipLabelBold: {
    fontSize: 14,
    fontFamily: fonts.semibold,
  },
  chipLabelMedium: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  chipDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
});
