import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { usePush } from "@/providers/push-provider";
import { useLocationPermission } from "./use-location-permission";
import { useNotificationPermission } from "./use-notification-permission";

/**
 * Sequences permission requests so the user isn't overwhelmed with
 * multiple native dialogs at once. Runs once on mount.
 *
 * Order: notifications → location (with a short delay between).
 */
export function useAppPermissions() {
  const notification = useNotificationPermission();
  const location = useLocationPermission();
  const { registerToken } = usePush();
  const requested = useRef(false);

  useEffect(() => {
    if (notification.isLoading || location.isLoading) return;
    if (requested.current) return;
    requested.current = true;

    (async () => {
      // 1. Notifications
      if (!notification.isGranted && notification.canAskAgain) {
        const status = await notification.request();
        if (status === Notifications.PermissionStatus.GRANTED) {
          registerToken();
        }
        // Brief pause so the user isn't hit with back-to-back dialogs
        await new Promise((r) => setTimeout(r, 800));
      }

      // 2. Location
      if (!location.isGranted && location.canAskAgain) {
        await location.request();
      }
    })();
  }, [
    notification.isLoading,
    location.isLoading,
    location.canAskAgain,
    location.isGranted,
    location.request,
    notification.canAskAgain,
    notification.isGranted,
    notification.request,
    registerToken,
  ]);

  return { notification, location };
}
