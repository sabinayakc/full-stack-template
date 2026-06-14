import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppModal } from "@/components/ui/app-modal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { fonts, radius, useTheme } from "@/styles";

export interface FooterAction {
  label: string;
  icon: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
  testID: string;
}

interface DetailActionFooterProps {
  primaryAction: FooterAction | null;
  dropdownActions: FooterAction[];
  isBusy?: boolean;
  moreButtonTestID?: string;
}

export function DetailActionFooter({
  primaryAction,
  dropdownActions,
  isBusy = false,
  moreButtonTestID = "more-actions",
}: DetailActionFooterProps) {
  const { colors: c } = useTheme();
  const [showDropup, setShowDropup] = useState(false);

  if (!primaryAction && dropdownActions.length === 0) return null;

  return (
    <>
      <AppModal
        visible={showDropup && dropdownActions.length > 0}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropup(false)}
      >
        <Pressable style={s.dropupBackdrop} onPress={() => setShowDropup(false)}>
          <View style={s.dropupAnchor}>
            <View style={[s.dropupMenu, { backgroundColor: c.bgSecondary, borderColor: c.border }]}>
              {dropdownActions.map((action) => (
                <Pressable
                  key={action.testID}
                  style={[s.dropupItem, { borderBottomColor: c.border }]}
                  onPress={() => {
                    setShowDropup(false);
                    action.onPress();
                  }}
                  disabled={isBusy || action.disabled}
                  testID={action.testID}
                >
                  <IconSymbol
                    name={action.icon as Parameters<typeof IconSymbol>[0]["name"]}
                    size={16}
                    color={action.danger ? c.danger : c.text}
                  />
                  <Text
                    style={[
                      s.dropupItemText,
                      { color: action.danger ? c.danger : c.text },
                      (isBusy || action.disabled) && { opacity: 0.4 },
                    ]}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </AppModal>

      <SafeAreaView
        edges={["bottom"]}
        style={[
          s.footerSafe,
          { backgroundColor: c.bg, borderTopColor: c.border },
          Platform.OS === "web" && s.footerSafeWeb,
        ]}
      >
        <View style={s.footerRow}>
          {dropdownActions.length > 0 && (
            <Pressable
              style={[s.footerMoreBtn, { borderColor: c.border, backgroundColor: c.bgSecondary }]}
              onPress={() => setShowDropup((v) => !v)}
              testID={moreButtonTestID}
            >
              <IconSymbol name="ellipsis" size={18} color={c.text} />
            </Pressable>
          )}
          {primaryAction && (
            <Pressable
              style={[
                s.footerPrimaryBtn,
                {
                  backgroundColor: c.primary,
                  opacity: isBusy || primaryAction.disabled ? 0.5 : 1,
                },
              ]}
              onPress={primaryAction.onPress}
              disabled={isBusy || primaryAction.disabled}
              testID={primaryAction.testID}
            >
              {isBusy ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <IconSymbol
                    name={primaryAction.icon as Parameters<typeof IconSymbol>[0]["name"]}
                    size={16}
                    color="#fff"
                  />
                  <Text style={s.footerPrimaryBtnText}>{primaryAction.label}</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </>
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
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  footerMoreBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footerPrimaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  footerPrimaryBtnText: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: "#fff",
  },
  dropupBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  dropupAnchor: {
    paddingHorizontal: 16,
    paddingBottom: 70,
  },
  dropupMenu: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  dropupItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropupItemText: {
    fontSize: 15,
    fontFamily: fonts.medium,
  },
});
