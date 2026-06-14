import { Stack } from "expo-router";
import { HeaderBackButton } from "@/components/ui/header-back-button";
import { useTheme } from "@/styles";

export default function AccountLayout() {
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
      <Stack.Screen name="profile" options={{ ...screenOptions, title: "Profile" }} />
      <Stack.Screen name="security" options={{ ...screenOptions, title: "Security" }} />
      <Stack.Screen name="two-factor-setup" options={{ ...screenOptions, title: "Enable 2FA" }} />
      <Stack.Screen name="two-factor-manage" options={{ ...screenOptions, title: "Manage 2FA" }} />
      <Stack.Screen name="sessions" options={{ ...screenOptions, title: "Active Sessions" }} />
    </Stack>
  );
}
