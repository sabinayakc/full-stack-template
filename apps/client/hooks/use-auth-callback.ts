import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

const AUTH_PATHS: Record<string, string> = {
  "verify-email": "/(auth)/verify-email",
  "reset-password": "/(auth)/reset-password",
  invitation: "/(org)/invitation",
};

function handleAuthUrl(url: string) {
  try {
    const parsed = Linking.parse(url);
    const path = parsed.path;
    if (!path) return;

    const segment = path.replace(/^\//, "").split("/")[0];
    const route = AUTH_PATHS[segment];
    if (!route) return;

    const params: Record<string, string> = {};
    if (parsed.queryParams) {
      for (const [key, value] of Object.entries(parsed.queryParams)) {
        if (typeof value === "string") {
          params[key] = value;
        }
      }
    }

    router.replace({ pathname: route as never, params });
  } catch {
    // Ignore malformed URLs
  }
}

export function useAuthCallback() {
  useEffect(() => {
    // On web, Expo Router already reads the URL and query params natively —
    // calling router.replace() here would strip the query string from the
    // browser URL bar and race with the initial render.
    if (Platform.OS === "web") return;

    // Handle URL that launched the app (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) handleAuthUrl(url);
    });

    // Handle URLs while app is running (warm start)
    const subscription = Linking.addEventListener("url", (event) => {
      handleAuthUrl(event.url);
    });

    return () => subscription.remove();
  }, []);
}
