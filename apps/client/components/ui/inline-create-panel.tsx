import type React from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { fonts, radius, spacing, useTheme } from "@/styles";

type InlineCreatePanelProps = {
  buttonLabel: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  toggleTestID?: string;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
};

export function InlineCreatePanel({
  buttonLabel,
  isOpen,
  onToggle,
  children,
  toggleTestID,
  style,
  contentStyle,
}: InlineCreatePanelProps) {
  const { colors: c } = useTheme();

  return (
    <View style={[s.container, style]}>
      <Pressable
        style={[s.toggleButton, { borderColor: c.border, backgroundColor: c.bgSecondary }]}
        onPress={onToggle}
        testID={toggleTestID}
      >
        <Text style={[s.toggleText, { color: c.primary }]}>{buttonLabel}</Text>
      </Pressable>
      {isOpen ? (
        <View
          style={[s.contentCard, { borderColor: c.border, backgroundColor: c.bg }, contentStyle]}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  toggleButton: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: "flex-start",
  },
  toggleText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
  },
  contentCard: {
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
});
