import "./mocks/auth";

import type React from "react";

// Suppress @expo/vector-icons async font-loading act() warnings in tests.
// The Icon component calls setState after loading fonts asynchronously,
// which triggers React 19's act() warning. This is a known issue with
// @expo/vector-icons and doesn't affect test correctness.
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].includes("not wrapped in act")) return;
  originalConsoleError(...args);
};

// Mock @react-native-async-storage/async-storage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const { View, Text } = require("react-native");
  return {
    __esModule: true,
    default: {
      View,
      Text,
      ScrollView: require("react-native").ScrollView,
      createAnimatedComponent: (c: unknown) => c,
    },
    useSharedValue: jest.fn((v: unknown) => ({ value: v })),
    useAnimatedRef: jest.fn(() => ({ current: null })),
    useScrollOffset: jest.fn(() => ({ value: 0 })),
    interpolate: jest.fn(() => 0),
    useAnimatedStyle: jest.fn(() => ({})),
    useAnimatedScrollHandler: jest.fn(() => jest.fn()),
    runOnJS: jest.fn((fn: unknown) => fn),
    withTiming: jest.fn((v: unknown) => v),
    withSpring: jest.fn((v: unknown) => v),
    withRepeat: jest.fn((v: unknown) => v),
    withSequence: jest.fn((v: unknown) => v),
    withDelay: jest.fn((_delay: number, v: unknown) => v),
    cancelAnimation: jest.fn(),
    Easing: {
      ease: "ease",
      inOut: jest.fn(() => "ease-in-out"),
      out: jest.fn(() => "ease-out"),
      in: jest.fn(() => "ease-in"),
    },
    FadeIn: { duration: jest.fn().mockReturnThis() },
    FadeOut: { duration: jest.fn().mockReturnThis() },
    SlideInRight: { duration: jest.fn().mockReturnThis() },
    SlideInLeft: { duration: jest.fn().mockReturnThis() },
    SlideOutLeft: { duration: jest.fn().mockReturnThis() },
    SlideOutRight: { duration: jest.fn().mockReturnThis() },
    SlideInDown: { duration: jest.fn().mockReturnThis() },
    Layout: { duration: jest.fn().mockReturnThis() },
  };
});

// Mock react-native-worklets
jest.mock("react-native-worklets", () => ({}));

// Mock expo-image
jest.mock("expo-image", () => {
  const View = require("react-native").View;
  return { Image: View };
});

// Mock expo-router
const { Text: RNText } = require("react-native");
const MockLink = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: unknown;
}) => {
  const React = require("react");
  return React.createElement(RNText, props, children);
};
MockLink.Trigger = () => null;
MockLink.Menu = () => null;
MockLink.MenuAction = () => null;
MockLink.Preview = () => null;
jest.mock("expo-router", () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
  useRouter: jest.fn(() => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() })),
  useSegments: jest.fn(() => []),
  usePathname: jest.fn(() => "/"),
  useLocalSearchParams: jest.fn(() => ({})),
  useNavigation: jest.fn(() => ({
    setOptions: jest.fn(),
    getParent: () => ({ setOptions: jest.fn() }),
    addListener: jest.fn(() => jest.fn()),
  })),
  useFocusEffect: jest.fn((cb: () => void) => cb()),
  Redirect: ({ href }: { href: string }) => {
    const { Text } = require("react-native");
    return require("react").createElement(Text, null, `Redirect:${href}`);
  },
  Link: MockLink,
  Slot: ({ children }: { children?: React.ReactNode }) => children ?? null,
  Stack: Object.assign(({ children }: { children?: React.ReactNode }) => children ?? null, {
    Screen: () => null,
  }),
}));

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-constants
jest.mock("expo-constants", () => ({
  expoConfig: {
    version: "1.0.0",
    extra: {
      webUrl: "http://localhost:8081",
      googleMapsApiKey: "test-google-maps-key",
    },
  },
}));

// Mock expo/fetch
jest.mock("expo/fetch", () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(""),
    }),
  ),
}));

// Mock expo-splash-screen
jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-linking
jest.mock("expo-linking", () => ({
  createURL: jest.fn((path: string) => `app://${path}`),
  parse: jest.fn((url: string) => {
    try {
      const parsed = new URL(url);
      const params: Record<string, string> = {};
      parsed.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return {
        path: parsed.pathname,
        queryParams: params,
      };
    } catch {
      return { path: url, queryParams: {} };
    }
  }),
  getInitialURL: jest.fn().mockResolvedValue(null),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: { Success: "success", Warning: "warning", Error: "error" },
}));

// Mock expo-clipboard
jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn().mockResolvedValue(undefined),
  getStringAsync: jest.fn().mockResolvedValue(""),
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: (props: { children?: React.ReactNode; testID?: string; style?: unknown }) =>
      React.createElement(View, { testID: props.testID, style: props.style }, props.children),
    SafeAreaProvider: ({ children }: { children?: React.ReactNode }) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});
