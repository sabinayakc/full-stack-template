import type React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { fonts, useTheme } from "@/styles";

type FormFieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  style?: ViewStyle;
};

export function FormField({ label, hint, error, children, style }: FormFieldProps) {
  const { colors: c } = useTheme();

  return (
    <View style={[s.container, style]}>
      {label || hint ? (
        <View style={s.labelBlock}>
          {label ? <Text style={[s.label, { color: c.textSecondary }]}>{label}</Text> : null}
          {hint ? <Text style={[s.hint, { color: c.textSecondary }]}>{hint}</Text> : null}
        </View>
      ) : null}
      {children}
      {error ? <Text style={[s.error, { color: c.danger }]}>{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    gap: 8,
  },
  labelBlock: {
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.18 * 11,
  },
  hint: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  error: {
    fontSize: 13,
    fontFamily: fonts.regular,
    lineHeight: 18,
  },
});
