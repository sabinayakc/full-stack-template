import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppLogo } from "@/components/ui/app-logo";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors, fonts } from "@/styles";

type RootErrorScreenProps = {
  icon?: string;
  title: string;
  subtitle?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function RootErrorScreen({
  icon = "exclamationmark.triangle",
  title,
  subtitle,
  onRetry,
  retryLabel = "Try Again",
}: RootErrorScreenProps) {
  return (
    <View style={s.container}>
      <AppLogo variant="splash" size={80} style={s.logo} testID="root-error-logo" />
      <IconSymbol name={icon} size={48} color={colors.light.textSecondary} />
      <Text style={[s.title, { marginTop: 16 }]}>{title}</Text>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      {onRetry ? (
        <Pressable style={s.retryBtn} onPress={onRetry} testID="root-error-retry">
          <IconSymbol name="arrow.clockwise" size={14} color="#fff" />
          <Text style={s.retryText}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.light.bg,
    paddingHorizontal: 32,
  },
  logo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.semibold,
    color: colors.light.text,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.light.primary,
    borderRadius: 999,
  },
  retryText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: "#fff",
  },
});
