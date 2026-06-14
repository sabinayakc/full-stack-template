import type React from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { haptic } from "@/lib/haptics";
import { fonts, radius, type ThemeColors, useTheme } from "@/styles";

type ButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "danger-outline"
  | "ghost"
  | "icon"
  | "inverted";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = PressableProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  testID?: string;
  children: React.ReactNode;
};

function getVariantStyles(variant: ButtonVariant, c: ThemeColors) {
  switch (variant) {
    case "default":
      return { bg: c.primary, border: c.primary, text: "#ffffff", spinner: "#ffffff" };
    case "secondary":
      return { bg: c.bgSecondary, border: c.border, text: c.text, spinner: c.primary };
    case "outline":
      return { bg: "transparent", border: c.primary, text: c.primary, spinner: c.primary };
    case "danger-outline":
      return { bg: "transparent", border: c.danger, text: c.danger, spinner: c.danger };
    case "ghost":
      return { bg: "transparent", border: "transparent", text: c.primary, spinner: c.primary };
    case "icon":
      return { bg: c.bgSecondary, border: c.border, text: c.text, spinner: c.primary };
    case "inverted":
      return { bg: c.text, border: c.text, text: c.bg, spinner: c.bg };
  }
}

export function Button({
  variant = "default",
  size = "md",
  isLoading = false,
  loadingText,
  testID,
  disabled,
  style,
  children,
  ...rest
}: ButtonProps) {
  const { colors: c } = useTheme();
  const v = getVariantStyles(variant, c);
  const isIcon = variant === "icon";
  const computedDisabled = disabled || isLoading;

  const sizeStyle = isIcon
    ? s.sizeIcon
    : size === "lg"
      ? s.sizeLg
      : size === "sm"
        ? s.sizeSm
        : s.sizeMd;

  const textStyle = size === "sm" ? s.textSm : s.text;

  const content =
    isIcon || typeof children !== "string" ? (
      children
    ) : (
      <Text style={[textStyle, { color: v.text }]}>{children}</Text>
    );

  return (
    <Pressable
      testID={testID}
      onPressIn={() => {
        haptic.light();
      }}
      style={[
        s.base,
        sizeStyle,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          opacity: computedDisabled ? 0.6 : 1,
        },
        style as ViewStyle,
      ]}
      disabled={computedDisabled}
      {...rest}
    >
      {isLoading ? (
        <View style={s.loadingRow}>
          <ActivityIndicator size="small" color={v.spinner} />
          {!isIcon ? (
            <Text style={[textStyle, { color: v.text }]}>{loadingText ?? "Please wait"}</Text>
          ) : null}
        </View>
      ) : (
        content
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  sizeSm: {
    height: 36,
    paddingHorizontal: 12,
  },
  sizeMd: {
    height: 48,
    paddingHorizontal: 16,
  },
  sizeLg: {
    height: 56,
    paddingHorizontal: 20,
  },
  sizeIcon: {
    height: 48,
    width: 48,
  },
  text: {
    fontSize: 16,
    fontFamily: fonts.semibold,
  },
  textSm: {
    fontSize: 13,
    fontFamily: fonts.semibold,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
