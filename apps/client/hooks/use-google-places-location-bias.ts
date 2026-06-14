import * as Location from "expo-location";
import { useEffect, useMemo, useState } from "react";
import { IS_NATIVE_APP } from "@/constants/app";
import { useLocationPermission } from "./use-location-permission";

export type GooglePlacesLocationBias = {
  circle: {
    center: {
      latitude: number;
      longitude: number;
    };
    radius: number;
  };
};

type UseGooglePlacesLocationBiasOptions = {
  radiusMeters?: number;
  requestIfPossible?: boolean;
};

export function useGooglePlacesLocationBias({
  radiusMeters = 50_000,
  requestIfPossible = false,
}: UseGooglePlacesLocationBiasOptions = {}) {
  const permission = useLocationPermission();
  const [coords, setCoords] = useState<Location.LocationObjectCoords | null>(null);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);

  useEffect(() => {
    if (!IS_NATIVE_APP || permission.isLoading) {
      return;
    }

    let cancelled = false;

    const resolveLocation = async () => {
      let status = permission.status;

      if (
        status !== Location.PermissionStatus.GRANTED &&
        requestIfPossible &&
        permission.canAskAgain
      ) {
        status = await permission.request();
      }

      if (status !== Location.PermissionStatus.GRANTED) {
        if (!cancelled) {
          setCoords(null);
          setIsResolvingLocation(false);
        }
        return;
      }

      if (!cancelled) {
        setIsResolvingLocation(true);
      }

      try {
        const lastKnown = await Location.getLastKnownPositionAsync();
        const position =
          lastKnown ??
          (await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }));

        if (!cancelled) {
          setCoords(position?.coords ?? null);
        }
      } catch {
        if (!cancelled) {
          setCoords(null);
        }
      } finally {
        if (!cancelled) {
          setIsResolvingLocation(false);
        }
      }
    };

    void resolveLocation();

    return () => {
      cancelled = true;
    };
  }, [
    permission.canAskAgain,
    permission.isLoading,
    permission.request,
    permission.status,
    requestIfPossible,
  ]);

  const locationBias = useMemo<GooglePlacesLocationBias | null>(() => {
    if (!coords) {
      return null;
    }

    return {
      circle: {
        center: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        radius: radiusMeters,
      },
    };
  }, [coords, radiusMeters]);

  return {
    ...permission,
    coords,
    isResolvingLocation,
    locationBias,
  };
}
