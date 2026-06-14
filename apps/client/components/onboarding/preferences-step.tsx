import { useCallback } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { fonts, radius, useTheme } from "@/styles";
import type { OnboardingState } from "./onboarding-state";

interface Props {
  state: OnboardingState;
  onChange: (state: OnboardingState) => void;
}

export function PreferencesStep({ state, onChange }: Props) {
  const prefs = state.userPreferences;
  const { colors: c } = useTheme();

  const updatePrefs = useCallback(
    (partial: Partial<typeof prefs>) => {
      onChange({
        ...state,
        userPreferences: { ...prefs, ...partial },
      });
    },
    [state, prefs, onChange],
  );

  return (
    <View style={s.sectionGap}>
      {/* Job Title */}
      <View style={s.fieldGap}>
        <Text style={[s.label, { color: c.text }]}>Your Job Title (optional)</Text>
        <TextInput
          testID="onboarding-job-title"
          style={[s.input, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]}
          placeholder="e.g. Manager"
          placeholderTextColor={c.textSecondary}
          value={prefs.jobTitle}
          onChangeText={(text) => updatePrefs({ jobTitle: text })}
          autoCapitalize="words"
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
});
