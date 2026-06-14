import { Stack } from "expo-router";
import { HeaderBackButton } from "@/components/ui/header-back-button";
import { useTheme } from "@/styles";

export default function SupportLayout() {
  const { colors: c } = useTheme();

  const screenOptions = {
    headerShown: true,
    headerStyle: { backgroundColor: c.bg },
    headerTintColor: c.primary,
    headerShadowVisible: false,
    headerTitleStyle: { color: c.text },
    headerLeft: () => <HeaderBackButton label="Settings" />,
  };

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="help-center" options={{ ...screenOptions, title: "Help Center" }} />
      <Stack.Screen name="contact" options={{ ...screenOptions, title: "Support" }} />
      <Stack.Screen name="privacy" options={{ ...screenOptions, title: "Privacy Policy" }} />
      <Stack.Screen name="terms" options={{ ...screenOptions, title: "Terms of Service" }} />
    </Stack>
  );
}
