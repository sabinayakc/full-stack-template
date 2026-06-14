import type { ExpoConfig } from "expo/config";

const isProduction = (process.env.EXPO_PUBLIC_ENV ?? process.env.NODE_ENV) === "production";

const WEB_HOST =
  process.env.EXPO_PUBLIC_WEB_HOST ?? (isProduction ? "app.example.com" : "app-dev.example.com");
const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL ?? `https://${WEB_HOST}`;

export default (): ExpoConfig => ({
  name: "App",
  slug: "app",
  version: "1.0.0",
  orientation: "default",
  icon: "./assets/images/icon.png",
  scheme: "app",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.example.app",
    entitlements: {
      "aps-environment": "production",
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
    associatedDomains: [`applinks:${WEB_HOST}`],
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#2050a0",
    },
    permissions: [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
      "android.permission.USE_BIOMETRIC",
      "android.permission.USE_FINGERPRINT",
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
    ],
    package: "com.example.app",
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          { scheme: "https", host: WEB_HOST, pathPrefix: "/invitation" },
          { scheme: "https", host: WEB_HOST, pathPrefix: "/verify-email" },
          { scheme: "https", host: WEB_HOST, pathPrefix: "/reset-password" },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#151718",
        },
      },
    ],
    [
      "expo-camera",
      {
        cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone",
        recordAudioAndroid: true,
      },
    ],
    [
      "expo-local-authentication",
      {
        faceIDPermission: "Allow $(PRODUCT_NAME) to use Face ID.",
      },
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location.",
      },
    ],
    "expo-secure-store",
    [
      "expo-image-picker",
      {
        photosPermission: "Allow $(PRODUCT_NAME) to use your photo library.",
      },
    ],
    "expo-font",
    "expo-web-browser",
    "expo-build-properties",
    "expo-image",
    "expo-mail-composer",
    "expo-sharing",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    webUrl: `https://${WEB_HOST}`,
    serverUrl: SERVER_URL,
    env: process.env.EXPO_PUBLIC_ENV ?? process.env.NODE_ENV ?? "development",
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    turnstileSiteKey: process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY,
    router: {},
    eas: {
      projectId: "cdc16093-6548-4ae8-9ecf-7a1378d90c0c",
    },
  },
});
