import { useQueryClient } from "@tanstack/react-query";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { EAS_PROJECT_ID } from "@/constants/app";
import { notificationKeys } from "@/hooks/use-notification-api";
import { fetchWithAuth } from "@/lib/api";
import { getDeviceId } from "@/lib/device-id";
import { useAuth } from "@/providers/auth-provider";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface PushContextValue {
  expoPushToken: string | null;
  registerToken: () => void;
}

const PushContext = createContext<PushContextValue>({
  expoPushToken: null,
  registerToken: () => {},
});

export function usePush() {
  return useContext(PushContext);
}

export function PushProvider({ children }: { children: React.ReactNode }) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const receivedListener = useRef<Notifications.EventSubscription | null>(null);

  const tryRegister = useCallback(() => {
    if (expoPushToken) return;
    getPushTokenIfGranted()
      .then(async (token) => {
        if (token) {
          setExpoPushToken(token);
          const deviceId = await getDeviceId();
          sendTokenToServer(token, deviceId);
        }
      })
      .catch((err) => {
        console.warn("Push token fetch failed (device may be offline):", err);
      });
  }, [expoPushToken]);

  // Register push token when authenticated (only if permission already granted)
  useEffect(() => {
    if (!isAuthenticated) return;
    tryRegister();
  }, [isAuthenticated, tryRegister]);

  // Re-check when the app returns to foreground so the token gets
  // registered after the user grants permission (e.g. via Settings)
  useEffect(() => {
    if (!isAuthenticated || expoPushToken) return;

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") tryRegister();
    });
    return () => sub.remove();
  }, [isAuthenticated, expoPushToken, tryRegister]);

  // Invalidate notification cache when a push arrives in the foreground
  useEffect(() => {
    receivedListener.current = Notifications.addNotificationReceivedListener(() => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    });

    return () => {
      if (receivedListener.current) {
        receivedListener.current.remove();
      }
    };
  }, [queryClient]);

  // Handle notification taps — deep link to the entity if `href` is provided,
  // otherwise fall back to the notifications list.
  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      const data = response.notification.request.content.data as { href?: unknown } | undefined;
      const href = typeof data?.href === "string" ? data.href : null;
      // biome-ignore lint/suspicious/noExplicitAny: dynamic deep link
      router.push((href ?? "./notifications") as any);
    });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router, queryClient]);

  return (
    <PushContext.Provider value={{ expoPushToken, registerToken: tryRegister }}>
      {children}
    </PushContext.Provider>
  );
}

/**
 * Gets the push token only if notification permission is already granted.
 * Does NOT request permission — that's handled by useAppPermissions.
 */
async function getPushTokenIfGranted(): Promise<string | null> {
  if (Platform.OS === "web") return null;
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: EAS_PROJECT_ID,
  });
  return tokenData.data;
}

async function sendTokenToServer(token: string, deviceId: string) {
  try {
    await fetchWithAuth("/notifications/push-token", {
      method: "POST",
      body: JSON.stringify({
        token,
        platform: Platform.OS,
        deviceId,
      }),
    });
  } catch (err) {
    console.error("Failed to register push token:", err);
  }
}
