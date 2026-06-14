import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import {
  Image,
  Platform,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import { APP_NAME } from "@/constants/app";
import { useWebLayout } from "@/hooks/use-web-layout";
import { fonts, useTheme } from "@/styles";

const isWeb = Platform.OS === "web";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const webBackgroundImage = require("@/assets/images/background-web.png");

type WebPageShellProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  headerTextStyle?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  footerStyle?: StyleProp<ViewStyle>;
  footerTextStyle?: StyleProp<TextStyle>;
  hideHeader?: boolean;
  hideFooter?: boolean;
  backgroundImage?: boolean;
  /** Skip the centered max-width column — content spans the full viewport. */
  fullWidth?: boolean;
};

/**
 * On web, wraps non-app pages (auth, public, portal) with a
 * consistent header and footer. Pass-through on native.
 */
export function WebPageShell({
  children,
  style,
  headerStyle,
  headerTextStyle,
  contentStyle,
  footerStyle,
  footerTextStyle,
  hideHeader,
  hideFooter,
  backgroundImage,
  fullWidth,
}: WebPageShellProps) {
  if (!isWeb) return <>{children}</>;

  return (
    <View style={[s.container, style]}>
      {backgroundImage && (
        <Image source={webBackgroundImage} resizeMode="cover" style={s.backgroundImage} />
      )}
      {!hideHeader && <WebHeader style={headerStyle} textStyle={headerTextStyle} />}
      <WebContent style={contentStyle} fullWidth={fullWidth}>
        {children}
      </WebContent>
      {!hideFooter && (
        <WebFooter style={footerStyle} textStyle={footerTextStyle} fullWidth={fullWidth} />
      )}
    </View>
  );
}

function WebContent({
  children,
  style,
  fullWidth,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}) {
  const { maxWidth, paddingHorizontal } = useWebLayout();

  if (fullWidth) {
    return <View style={[s.content, style]}>{children}</View>;
  }

  return <View style={[s.content, { maxWidth, paddingHorizontal }, style]}>{children}</View>;
}

function WebHeader({
  style,
  textStyle,
}: {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  const router = useRouter();
  const { colors: c } = useTheme();
  const { maxWidth, paddingHorizontal } = useWebLayout();

  return (
    <View style={[s.header, { borderBottomColor: c.border, paddingHorizontal }, style]}>
      <View style={[s.headerInner, { maxWidth }]}>
        <Pressable onPress={() => router.push("/")}>
          <Text style={[s.logo, { color: c.primary }, textStyle]}>{APP_NAME}</Text>
        </Pressable>
        <View style={s.headerNav}>
          <Pressable
            style={[s.navButton, { backgroundColor: c.primary }]}
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <Text style={[s.navButtonText, textStyle]}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function WebFooter({
  style,
  textStyle,
  fullWidth,
}: {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}) {
  const router = useRouter();
  const { colors: c } = useTheme();
  const { maxWidth, paddingHorizontal } = useWebLayout();

  const currentYear = new Date().getFullYear();

  return (
    <View
      style={[
        s.footer,
        { borderTopColor: c.border, paddingHorizontal: fullWidth ? 24 : paddingHorizontal },
        style,
      ]}
    >
      <View style={[s.footerInner, { maxWidth: fullWidth ? undefined : maxWidth }]}>
        <Text style={[s.footerText, { color: c.textSecondary }, textStyle]}>
          {currentYear} {APP_NAME}. All rights reserved.
        </Text>
        <View style={s.footerLinks}>
          <Pressable onPress={() => router.push("/(public)/privacy")}>
            <Text style={[s.footerLink, { color: c.textSecondary }, textStyle]}>Privacy</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/(public)/terms")}>
            <Text style={[s.footerLink, { color: c.textSecondary }, textStyle]}>Terms</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    // Clip off-canvas drawer content (portal sidebar) so it doesn't bleed
    // into the main page when collapsed on narrow viewports.
    overflow: "hidden",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },

  // Header
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    alignSelf: "center",
  },
  logo: {
    fontSize: 20,
    fontFamily: fonts.bold,
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  navLink: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navButtonText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
  },

  // Content
  content: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    overflow: "hidden",
  },

  // Footer
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 16,
  },
  footerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    alignSelf: "center",
  },
  footerText: {
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  footerLinks: {
    flexDirection: "row",
    gap: 20,
  },
  footerLink: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
});
