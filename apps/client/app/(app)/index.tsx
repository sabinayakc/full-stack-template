import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/providers/auth-provider";
import { fonts, spacing, useTheme } from "@/styles";

export default function HomeScreen() {
  const { user, activeOrganization } = useAuth();
  const { colors: c } = useTheme();

  return (
    <View style={[s.container, { backgroundColor: c.bg }]}>
      <Text style={[s.title, { color: c.text }]}>Welcome{user?.name ? `, ${user.name}` : ""}</Text>
      {activeOrganization?.name ? (
        <Text style={[s.subtitle, { color: c.textSecondary }]}>{activeOrganization.name}</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.bold,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
  },
});
