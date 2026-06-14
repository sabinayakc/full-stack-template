import Constants from "expo-constants";
import { Dimensions, Platform } from "react-native";

export const APP_NAME = "App";

export const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

export const APP_ENVIRONMENT =
  (Constants.expoConfig?.extra?.env as string | undefined) ?? "development";

export const APP_VERSION_DISPLAY =
  APP_ENVIRONMENT !== "production"
    ? `${APP_VERSION} ${APP_ENVIRONMENT.charAt(0).toUpperCase() + APP_ENVIRONMENT.slice(1)}`
    : APP_VERSION;

export const SERVER_URL =
  (Constants.expoConfig?.extra?.serverUrl as string | undefined) ??
  (__DEV__ ? "http://localhost:4000" : "https://app-dev.example.com");

export const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey as
  | string
  | undefined;

export const IS_NATIVE_APP = Platform.OS === "ios" || Platform.OS === "android";

export const EAS_PROJECT_ID = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;

export const SUPPORT_EMAIL =
  (Constants.expoConfig?.extra?.supportEmail as string | undefined) ?? "support@example.com";

export const TURNSTILE_SITE_KEY =
  (Constants.expoConfig?.extra?.turnstileSiteKey as string | undefined) ?? "";

export const DIMENSIONS = {
  height: Dimensions.get("screen").height,
  width: Dimensions.get("screen").width,
};

/** @deprecated Use `useWebLayout()` hook for responsive max-width values. */
export const MAX_WIDTH_WEB = DIMENSIONS.width * 0.75;
