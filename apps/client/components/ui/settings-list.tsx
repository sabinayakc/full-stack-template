import type React from "react";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { fonts, radius, spacing, useTheme } from "@/styles";

type SettingsListSectionProps = {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
};

export function SettingsListSection({
  title,
  right,
  children,
  collapsible,
  defaultCollapsed,
}: SettingsListSectionProps) {
  const { colors: c } = useTheme();
  const [collapsed, setCollapsed] = useState(collapsible ? (defaultCollapsed ?? false) : false);

  return (
    <View style={s.section}>
      {title ? (
        <View style={s.sectionHeader}>
          {collapsible ? (
            <Pressable style={s.sectionHeaderPressable} onPress={() => setCollapsed((v) => !v)}>
              <IconSymbol
                name="chevron.right"
                size={12}
                weight="semibold"
                color={c.textSecondary}
                style={{ transform: [{ rotate: collapsed ? "0deg" : "90deg" }] }}
              />
              <Text style={[s.sectionTitle, { color: c.textSecondary }]}>{title}</Text>
            </Pressable>
          ) : (
            <Text style={[s.sectionTitle, { color: c.textSecondary }]}>{title}</Text>
          )}
          {right}
        </View>
      ) : null}
      {!collapsed && (
        <View style={[s.sectionCard, { backgroundColor: c.bgSecondary, borderColor: c.border }]}>
          {children}
        </View>
      )}
    </View>
  );
}

type SettingsListItemProps = {
  icon?: string;
  iconColor?: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
  loading?: boolean;
  showChevron?: boolean;
  isLast?: boolean;
  testID?: string;
};

export function SettingsListItem({
  icon,
  iconColor,
  label,
  subtitle,
  onPress,
  right,
  destructive,
  loading,
  showChevron = true,
  isLast,
  testID,
}: SettingsListItemProps) {
  const { colors: c } = useTheme();
  const textColor = destructive ? c.danger : c.text;
  const resolvedIconColor = iconColor ?? (destructive ? c.danger : c.textSecondary);

  return (
    <Pressable
      testID={testID}
      style={[
        s.item,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
        loading && { opacity: 0.6 },
      ]}
      onPress={onPress}
      disabled={!onPress || loading}
    >
      {icon ? <IconSymbol name={icon} size={20} color={resolvedIconColor} /> : null}
      <View style={s.itemContent}>
        <Text style={[s.itemLabel, { color: textColor }]}>{label}</Text>
        {subtitle ? (
          <Text style={[s.itemSubtitle, { color: c.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={c.textSecondary} />
      ) : (
        (right ??
        (onPress && showChevron ? (
          <IconSymbol name="chevron.right" size={16} color={c.textSecondary} />
        ) : null))
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    marginHorizontal: spacing.sm,
  },
  sectionHeaderPressable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 15,
    fontFamily: fonts.regular,
  },
  itemSubtitle: {
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
});
