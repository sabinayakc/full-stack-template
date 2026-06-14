import { Stack } from "expo-router";
import { HeaderBackButton } from "@/components/ui/header-back-button";
import { useTheme } from "@/styles";

export default function NotificationsLayout() {
  const { colors: c } = useTheme();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          title: "Notifications",
          headerStyle: { backgroundColor: c.bg },
          headerTintColor: c.primary,
          headerShadowVisible: false,
          headerTitleStyle: { color: c.text },
          headerLeft: () => <HeaderBackButton label="Settings" />,
        }}
      />
    </Stack>
  );
}
