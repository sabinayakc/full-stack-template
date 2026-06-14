import * as Clipboard from "expo-clipboard";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { fonts, useTheme } from "@/styles";

interface InfoRowProps {
  label: string;
  value: string | null | undefined;
  copyable?: boolean;
}

export function InfoRow({ label, value, copyable }: InfoRowProps) {
  const { colors: c } = useTheme();
  const [copied, setCopied] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (!value) return;
    await Clipboard.setStringAsync(value);
    setCopied(true);
    Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
        setCopied(false),
      );
    }, 1200);
  }, [value, fadeAnim]);

  if (!value) return null;

  const valueEl = <Text style={[s.value, { color: c.text }]}>{value}</Text>;

  return (
    <View style={s.row}>
      <Text style={[s.label, { color: c.textSecondary }]}>{label}</Text>
      {copyable ? (
        <Pressable onPress={handleCopy} style={s.copyable}>
          {valueEl}
          {copied && (
            <Animated.Text style={[s.copiedText, { opacity: fadeAnim, color: c.success }]}>
              Copied!
            </Animated.Text>
          )}
        </Pressable>
      ) : (
        valueEl
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.regular,
    flexShrink: 0,
  },
  value: {
    fontSize: 14,
    fontFamily: fonts.medium,
    flex: 1,
    textAlign: "right",
  },
  copyable: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    flex: 1,
    justifyContent: "flex-end" as const,
  },
  copiedText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    flexShrink: 0,
  },
});
