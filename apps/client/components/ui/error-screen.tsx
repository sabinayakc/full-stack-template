import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppLogo } from "@/components/ui/app-logo";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { fonts, useTheme } from "@/styles";

type ErrorScreenProps = {
  icon?: string;
  title: string;
  subtitle?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorScreen({
  icon = "exclamationmark.triangle",
  title,
  subtitle,
  onRetry,
  retryLabel = "Try Again",
}: ErrorScreenProps) {
  const { colors: c } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[s.container, { backgroundColor: c.bg }]} edges={["top"]}>
      <View style={s.content}>
        <Pressable
          style={[s.backBtn, { borderColor: c.border, backgroundColor: c.bgSecondary }]}
          onPress={() => router.back()}
          testID="error-screen-back"
        >
          <IconSymbol name="chevron.left" size={18} color={c.textSecondary} />
        </Pressable>

        <View style={s.body}>
          <AppLogo variant="splash" size={80} style={s.logo} testID="error-screen-logo" />
          <IconSymbol name={icon} size={48} color={c.textSecondary} />
          <Text style={[s.title, { color: c.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[s.subtitle, { color: c.textSecondary }]}>{subtitle}</Text>
          ) : null}

          <View style={s.actions}>
            {onRetry ? (
              <Pressable
                style={[s.retryBtn, { backgroundColor: c.primary }]}
                onPress={onRetry}
                testID="error-screen-retry"
              >
                <IconSymbol name="arrow.clockwise" size={14} color="#fff" />
                <Text style={s.retryText}>{retryLabel}</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={[s.goBackBtn, { borderColor: c.border }]}
              onPress={() => router.back()}
              testID="error-screen-go-back"
            >
              <Text style={[s.goBackText, { color: c.text }]}>Go Back</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
  },
  logo: {
    marginBottom: 24,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    marginTop: -36,
  },
  title: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: fonts.semibold,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: fonts.regular,
    textAlign: "center",
    lineHeight: 20,
  },
  actions: {
    marginTop: 24,
    alignItems: "center",
    gap: 12,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  retryText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: "#fff",
  },
  goBackBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  goBackText: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
});
