import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";

interface LocationPermissionState {
  status: Location.PermissionStatus | null;
  canAskAgain: boolean;
  isLoading: boolean;
}

/**
 * Reusable hook for location foreground permission.
 * Checks current status on mount and exposes a `request` function
 * that only prompts the native dialog when the OS allows it.
 */
export function useLocationPermission() {
  const [state, setState] = useState<LocationPermissionState>({
    status: null,
    canAskAgain: true,
    isLoading: true,
  });

  useEffect(() => {
    Location.getForegroundPermissionsAsync().then((result) => {
      setState({
        status: result.status,
        canAskAgain: result.canAskAgain,
        isLoading: false,
      });
    });
  }, []);

  const request = useCallback(async () => {
    const current = await Location.getForegroundPermissionsAsync();
    if (current.status === Location.PermissionStatus.GRANTED) {
      setState({ status: current.status, canAskAgain: current.canAskAgain, isLoading: false });
      return current.status;
    }

    if (!current.canAskAgain) {
      setState({ status: current.status, canAskAgain: false, isLoading: false });
      return current.status;
    }

    const result = await Location.requestForegroundPermissionsAsync();
    setState({ status: result.status, canAskAgain: result.canAskAgain, isLoading: false });
    return result.status;
  }, []);

  return {
    status: state.status,
    isGranted: state.status === Location.PermissionStatus.GRANTED,
    canAskAgain: state.canAskAgain,
    isLoading: state.isLoading,
    request,
  };
}
