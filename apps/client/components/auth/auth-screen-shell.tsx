import { type Href, Link, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import type { ReactNode } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ContactSupport } from "@/components/auth/contact-support";
import { AppLogo } from "@/components/ui/app-logo";
import { KeyboardView } from "@/components/ui/keyboard-view";
import { APP_NAME, APP_VERSION_DISPLAY, DIMENSIONS } from "@/constants/app";
import { fonts, useTheme } from "@/styles";
import { BrandColor } from "@/styles/theme";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const animation = require("@/assets/lottie/entry.json");

type AuthScreenShellProps = {
  title: string;
  subtitle: string;
  prompt?: string;
  actionHref?: Href;
  actionLabel?: string;
  headerContent?: ReactNode;
  children: ReactNode;
};

export function AuthScreenShell({
  title,
  subtitle,
  prompt,
  actionHref,
  actionLabel,
  headerContent,
  children,
}: AuthScreenShellProps) {
  const router = useRouter();
  const { colors: c } = useTheme();

  return (
    <SafeAreaView
      style={[s.safeArea, { backgroundColor: Platform.OS === "web" ? "transparent" : BrandColor }]}
      edges={["top", "bottom"]}
    >
      <View style={s.bgBottomWrap} pointerEvents="none">
        {Platform.OS !== "web" && (
          <LottieView source={animation} autoPlay loop style={s.bgAnimation} />
        )}
      </View>
      <KeyboardView>
        <View style={[s.outerContainer]}>
          <ScrollView
            contentContainerStyle={s.scrollContent}
            style={s.flex1}
            contentInsetAdjustmentBehavior="always"
            keyboardShouldPersistTaps="handled"
          >
            <View style={s.innerContainer}>
              <View style={s.headerContainer}>
                {headerContent ?? (
                  <AppLogo
                    size={52}
                    containerStyle={[s.logoBox, { borderColor: c.border, backgroundColor: c.bg }]}
                    testID="auth-logo"
                  />
                )}
                <Text style={[s.appName, { color: c.bg }]}>{APP_NAME}</Text>
              </View>

              <View
                style={[
                  s.card,
                  {
                    backgroundColor: c.semiTransparent,
                    borderColor: c.semiTransparent,
                  },
                ]}
              >
                <View style={s.titleContainer}>
                  <Text style={[s.title, { color: c.text }]}>{title}</Text>
                  <Text style={[s.subtitle, { color: c.textSecondary }]}>{subtitle}</Text>
                </View>

                {children}

                {prompt && actionHref && actionLabel ? (
                  <View style={s.promptRow}>
                    <Text style={[s.promptText, { color: c.textSecondary }]}>{prompt}</Text>
                    <Link href={actionHref} asChild>
                      <Pressable>
                        <Text style={[s.actionLabel, { color: c.primary }]}>{actionLabel}</Text>
                      </Pressable>
                    </Link>
                  </View>
                ) : null}
              </View>

              <ContactSupport />

              <View style={s.legalContainer}>
                <View style={s.legalRow}>
                  <Pressable onPress={() => router.push("/(public)/privacy")}>
                    <Text style={[s.legalLink, { color: c.primary }]}>Privacy Policy</Text>
                  </Pressable>
                  <Text style={[s.legalDot, { color: c.textSecondary }]}>&bull;</Text>
                  <Pressable onPress={() => router.push("/(public)/terms")}>
                    <Text style={[s.legalLink, { color: c.primary }]}>Terms</Text>
                  </Pressable>
                </View>
                <Text style={[s.versionText, { color: c.textSecondary }]}>
                  Version {APP_VERSION_DISPLAY}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  outerContainer: {
    flex: 1,
    position: "relative",
  },
  bgBottomWrap: {
    position: "absolute",
    zIndex: 0,
  },
  bgAnimation: {
    width: DIMENSIONS.width,
    height: DIMENSIONS.height,
    transform: [{ rotate: "90deg" }, { scale: 2.5 }],
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  innerContainer: {
    gap: 24,
  },
  headerContainer: {
    alignItems: "center",
    gap: 8,
  },
  logoBox: {
    height: 80,
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
  },
  appName: {
    fontSize: 24,
    fontFamily: fonts.bold,
    letterSpacing: 1,
  },
  card: {
    gap: 16,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  titleContainer: {
    gap: 4,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.semibold,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  promptRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  promptText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  actionLabel: {
    fontSize: 14,
    fontFamily: fonts.semibold,
  },
  legalContainer: {
    alignItems: "center",
    gap: 8,
  },
  legalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  legalLink: {
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  legalDot: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  versionText: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
});
