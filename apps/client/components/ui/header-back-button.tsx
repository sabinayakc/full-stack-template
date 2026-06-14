import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { fonts, useTheme } from "@/styles";

type HeaderBackButtonProps = {
  label?: string;
};

export function HeaderBackButton({ label = "Back" }: HeaderBackButtonProps) {
  const { colors: c } = useTheme();
  const router = useRouter();

  return (
    <Pressable style={s.container} onPress={() => router.back()}>
      <IconSymbol name="chevron.left" size={22} color={c.text} />
      <Text style={[s.label, { color: c.text }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: -4,
    paddingRight: 8,
  },
  label: {
    fontSize: 17,
    fontFamily: fonts.regular,
  },
});
