import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Slot, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
  useFonts,
} from "@expo-google-fonts/inter";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ConfirmDialog, ConfirmInputDialog, PromptDialog } from "@/components/ui/confirm-dialog";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { RootErrorScreen } from "@/components/ui/root-error-screen";

import { useAuthCallback } from "@/hooks/use-auth-callback";
import { useAuthGate } from "@/hooks/use-auth-gate";
import { useHealthCheck } from "@/hooks/use-health-check";
import { AppearanceProvider, useAppearance } from "@/providers/appearance-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { PushProvider } from "@/providers/push-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { colors } from "@/styles";

SplashScreen.preventAutoHideAsync();

function useIsPublicRoute() {
  const segments = useSegments();
  return segments[0] === "(public)";
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <RootErrorScreen title="Something Went Wrong" subtitle={error.message} onRetry={retry} />;
}

function AuthGate({ children, fontsLoaded }: { children: React.ReactNode; fontsLoaded: boolean }) {
  useAuthCallback();
  const { isReady } = useAuthGate(fontsLoaded);
  const { colorScheme } = useAppearance();
  const isPublic = useIsPublicRoute();

  // Public pages (terms, privacy) are static content — render them immediately
  // without waiting on auth, so they appear instantly and land in the prerendered
  // HTML produced by `expo export`.
  if (!isReady && !isPublic) return <LoadingScreen dark={colorScheme === "dark"} />;

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AppearanceProvider>
      <AppShell />
    </AppearanceProvider>
  );
}

function AppShell() {
  const { colorScheme } = useAppearance();

  const [fontsLoaded] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  const { status, retry } = useHealthCheck();
  const isPublic = useIsPublicRoute();

  const ready = fontsLoaded && colorScheme !== null && status !== "checking";

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  // Public pages (terms, privacy) are static and don't depend on fonts loading,
  // the server being reachable, or the stored color scheme — render them right
  // away so they show instantly and are captured in the prerendered HTML.
  if (isPublic) {
    return <RootLayoutContent fontsLoaded={fontsLoaded} />;
  }

  if (!fontsLoaded || colorScheme === null || status === "checking") {
    return null;
  }

  if (status === "unreachable") {
    return (
      <RootErrorScreen
        icon="wifi.slash"
        title="Server Unreachable"
        subtitle="Unable to connect to the server. Please check your connection and try again."
        onRetry={() => retry()}
      />
    );
  }

  return <RootLayoutContent fontsLoaded={fontsLoaded} />;
}

function RootLayoutContent({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { colorScheme } = useAppearance();

  const rootBg =
    colorScheme === "dark"
      ? colors.dark.bg
      : colorScheme === "light"
        ? colors.light.bg
        : colors.light.bg;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={[root.flex1, { backgroundColor: rootBg }]}>
        <SafeAreaProvider>
          <QueryProvider>
            <AuthProvider>
              <PushProvider>
                <ToastProvider>
                  <AuthGate fontsLoaded={fontsLoaded}>
                    <Slot />
                  </AuthGate>
                </ToastProvider>
              </PushProvider>
            </AuthProvider>
          </QueryProvider>
        </SafeAreaProvider>
        <ConfirmDialog />
        <ConfirmInputDialog />
        <PromptDialog />
      </View>
    </ThemeProvider>
  );
}

const root = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});
