import { Stack } from "expo-router";
import { WebPageShell } from "@/components/ui/web-page-shell";

export default function OrgLayout() {
  return (
    <WebPageShell hideHeader>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="org" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="invitation" />
      </Stack>
    </WebPageShell>
  );
}
