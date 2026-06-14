import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts, radius, spacing, useTheme } from "@/styles";

interface SettingsActionFooterProps {
  visible: boolean;
  saving: boolean;
  onReset: () => void;
  onSave: () => void;
  saveLabel?: string;
  testIDPrefix?: string;
}

export function SettingsActionFooter({
  visible,
  saving,
  onReset,
  onSave,
  saveLabel = "Save Changes",
  testIDPrefix = "settings",
}: SettingsActionFooterProps) {
  const { colors: c } = useTheme();

  if (!visible) return null;

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[
        s.footerSafe,
        { backgroundColor: c.bg, borderTopColor: c.border },
        Platform.OS === "web" && s.footerSafeWeb,
      ]}
    >
      <View style={s.footerRow}>
        <Pressable
          style={[s.resetBtn, { borderColor: c.border }]}
          onPress={onReset}
          disabled={saving}
          testID={`${testIDPrefix}-reset`}
        >
          <Text style={[s.resetBtnText, { color: c.text }]}>Reset</Text>
        </Pressable>
        <Pressable
          style={[s.saveBtn, { backgroundColor: c.primary, opacity: saving ? 0.5 : 1 }]}
          onPress={onSave}
          disabled={saving}
          testID={`${testIDPrefix}-save`}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={s.saveBtnText}>{saveLabel}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  footerSafe: {
    borderTopWidth: 1,
  },
  footerSafeWeb: {
    paddingBottom: 16,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtnText: {
    fontSize: 15,
    fontFamily: fonts.medium,
  },
  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontFamily: fonts.semibold,
  },
});
