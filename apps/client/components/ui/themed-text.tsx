import * as Clipboard from "expo-clipboard";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, type TextProps } from "react-native";
import { fonts, type ThemeColors, useTheme } from "@/styles";

type TextType = "default" | "secondary" | "title" | "subtitle" | "label" | "caption";

type ThemedTextProps = TextProps & {
  type?: TextType;
  copyable?: boolean;
  children?: ReactNode;
};

const typeStyles: Record<
  TextType,
  { fontSize: number; fontFamily: string; colorKey: keyof ThemeColors }
> = {
  default: { fontSize: 14, fontFamily: fonts.regular, colorKey: "text" },
  secondary: { fontSize: 14, fontFamily: fonts.regular, colorKey: "textSecondary" },
  title: { fontSize: 24, fontFamily: fonts.bold, colorKey: "text" },
  subtitle: { fontSize: 16, fontFamily: fonts.semibold, colorKey: "text" },
  label: { fontSize: 11, fontFamily: fonts.semibold, colorKey: "textSecondary" },
  caption: { fontSize: 12, fontFamily: fonts.regular, colorKey: "textSecondary" },
};

export function ThemedText({
  type = "default",
  style,
  copyable,
  children,
  ...props
}: ThemedTextProps) {
  const { colors: c } = useTheme();
  const ts = typeStyles[type];
  const [copied, setCopied] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    const text =
      typeof children === "string"
        ? children
        : typeof children === "number"
          ? String(children)
          : "";
    if (!text) return;
    await Clipboard.setStringAsync(text);
    setCopied(true);
    Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
        setCopied(false),
      );
    }, 1200);
  }, [children, fadeAnim]);

  const textEl = (
    <Text
      style={[{ fontSize: ts.fontSize, fontFamily: ts.fontFamily, color: c[ts.colorKey] }, style]}
      {...props}
    >
      {children}
    </Text>
  );

  if (!copyable) return textEl;

  return (
    <Pressable onPress={handleCopy} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      {textEl}
      {copied && (
        <Animated.Text
          style={{
            opacity: fadeAnim,
            fontSize: 11,
            fontFamily: fonts.medium,
            color: c.success,
          }}
        >
          Copied!
        </Animated.Text>
      )}
    </Pressable>
  );
}
