import { StyleSheet, View, type ViewProps } from "react-native";
import { useTheme } from "@/styles";

export function Divider({ style, ...props }: ViewProps) {
  const { colors: c } = useTheme();
  return <View style={[s.divider, { backgroundColor: c.border }, style]} {...props} />;
}

const s = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
