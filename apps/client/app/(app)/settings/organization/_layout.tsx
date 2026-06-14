import { Stack } from "expo-router";
import { HeaderBackButton } from "@/components/ui/header-back-button";
import { useTheme } from "@/styles";

export default function OrganizationLayout() {
  const { colors: c } = useTheme();

  const screenOptions = {
    headerShown: true,
    headerStyle: { backgroundColor: c.bg },
    headerTintColor: c.primary,
    headerShadowVisible: false,
    headerTitleStyle: { color: c.text },
  };

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          ...screenOptions,
          title: "Organization",
          headerLeft: () => <HeaderBackButton label="Settings" />,
        }}
      />
      <Stack.Screen name="members" options={{ ...screenOptions, title: "Members" }} />
    </Stack>
  );
}
