import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

interface NotificationPermissionState {
  status: Notifications.PermissionStatus | null;
  canAskAgain: boolean;
  isLoading: boolean;
}

/**
 * Reusable hook for notification permission.
 * Checks current status on mount and exposes a `request` function
 * that only prompts the native dialog when the OS allows it.
 */
export function useNotificationPermission() {
  const [state, setState] = useState<NotificationPermissionState>({
    status: null,
    canAskAgain: true,
    isLoading: true,
  });

  useEffect(() => {
    if (Platform.OS === "web" || !Device.isDevice) {
      setState({ status: null, canAskAgain: false, isLoading: false });
      return;
    }

    Notifications.getPermissionsAsync().then((result) => {
      setState({
        status: result.status,
        canAskAgain: result.canAskAgain,
        isLoading: false,
      });
    });
  }, []);

  const request = useCallback(async () => {
    if (Platform.OS === "web" || !Device.isDevice) return null;

    const current = await Notifications.getPermissionsAsync();
    if (current.status === Notifications.PermissionStatus.GRANTED) {
      setState({ status: current.status, canAskAgain: current.canAskAgain, isLoading: false });
      return current.status;
    }

    if (!current.canAskAgain) {
      setState({ status: current.status, canAskAgain: false, isLoading: false });
      return current.status;
    }

    const result = await Notifications.requestPermissionsAsync();
    setState({ status: result.status, canAskAgain: result.canAskAgain, isLoading: false });
    return result.status;
  }, []);

  return {
    status: state.status,
    isGranted: state.status === Notifications.PermissionStatus.GRANTED,
    canAskAgain: state.canAskAgain,
    isLoading: state.isLoading,
    request,
  };
}
