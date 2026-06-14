import { Stack } from "expo-router";
import { View } from "react-native";
import { useTheme } from "@/styles";

export default function SettingsLayout() {
  const { colors: c } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="organization" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="account" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="integrations" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="subscription" />
        <Stack.Screen name="support" />
      </Stack>
    </View>
  );
}
