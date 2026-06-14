import { StyleSheet, Text, View } from "react-native";
import { fonts } from "@/styles";

interface StatusBadgeProps {
  status: string;
  colorMap: Record<string, { bg: string; text: string }>;
  fallbackKey?: string;
}

export function StatusBadge({ status, colorMap, fallbackKey }: StatusBadgeProps) {
  const colors = colorMap[status] ??
    colorMap[fallbackKey ?? ""] ?? { bg: "#e4e4e7cc", text: "#3f3f46" };

  return (
    <View style={[s.badge, { backgroundColor: colors.bg }]}>
      <Text style={[s.text, { color: colors.text }]}>{status}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.12 * 11,
    marginRight: -0.12 * 11,
  },
});
