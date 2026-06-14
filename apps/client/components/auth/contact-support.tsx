import * as Linking from "expo-linking";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SUPPORT_EMAIL } from "@/constants/app";
import { fonts, useTheme } from "@/styles";

type ContactSupportProps = {
  subject?: string;
};

export function ContactSupport({ subject }: ContactSupportProps) {
  const { colors: c } = useTheme();

  const handlePress = () => {
    const params = subject ? `?subject=${encodeURIComponent(subject)}` : "";
    Linking.openURL(`mailto:${SUPPORT_EMAIL}${params}`);
  };

  return (
    <View style={s.container}>
      <Text style={[s.label, { color: c.textSecondary }]}>Having trouble?</Text>
      <Pressable onPress={handlePress} hitSlop={8}>
        <Text style={[s.link, { color: c.primary }]}>Contact Support</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  link: {
    fontSize: 13,
    fontFamily: fonts.semibold,
  },
});
