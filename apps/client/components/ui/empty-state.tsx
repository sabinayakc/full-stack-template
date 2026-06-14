import { StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { fonts } from "@/styles";

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  iconColor?: string;
}

export function EmptyState({ icon, title, subtitle, iconColor = "#9ca3af" }: EmptyStateProps) {
  return (
    <View style={s.container}>
      <IconSymbol name={icon} size={48} color={iconColor} />
      <Text style={s.title}>{title}</Text>
      <Text style={s.subtitle}>{subtitle}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  title: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 16,
    fontFamily: fonts.regular,
    color: "#9ca3af",
  },
  subtitle: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#9ca3af",
  },
});
