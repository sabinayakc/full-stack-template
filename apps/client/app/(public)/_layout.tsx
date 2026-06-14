import { Stack } from "expo-router";
import { HeaderBackButton } from "@/components/ui/header-back-button";
import { WebPageShell } from "@/components/ui/web-page-shell";

export default function PublicLayout() {
  const legalScreenOptions = {
    headerShown: true,
    headerStyle: { backgroundColor: "#0a7ea4" },
    headerTintColor: "#ffffff",
    headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
    headerLeft: () => <HeaderBackButton label="Back" />,
  };

  return (
    <WebPageShell>
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: "#0a7ea4" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        }}
      >
        <Stack.Screen name="privacy" options={{ ...legalScreenOptions, title: "Privacy Policy" }} />
        <Stack.Screen name="terms" options={{ ...legalScreenOptions, title: "Terms of Service" }} />
      </Stack>
    </WebPageShell>
  );
}
