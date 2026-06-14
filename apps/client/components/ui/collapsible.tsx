import { type PropsWithChildren, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { fonts, useTheme } from "@/styles";

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { colors: c } = useTheme();

  return (
    <View>
      <Pressable style={s.heading} onPress={() => setIsOpen((v) => !v)}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={c.textSecondary}
          style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}
        />
        <Text style={[s.title, { color: c.text }]}>{title}</Text>
      </Pressable>
      {isOpen && <View style={s.content}>{children}</View>}
    </View>
  );
}

const s = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.semibold,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
