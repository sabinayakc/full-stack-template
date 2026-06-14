import { Platform, useWindowDimensions } from "react-native";

type Breakpoint = "mobile" | "tablet" | "desktop";

type WebLayout = {
  breakpoint: Breakpoint;
  maxWidth: number | undefined;
  paddingHorizontal: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};

const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
} as const;

const isWeb = Platform.OS === "web";

/**
 * Returns responsive layout values for web based on current window width.
 * On native, returns mobile defaults (no max-width, no padding).
 */
export function useWebLayout(): WebLayout {
  const { width } = useWindowDimensions();

  if (!isWeb) {
    return {
      breakpoint: "mobile",
      maxWidth: undefined,
      paddingHorizontal: 0,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    };
  }

  if (width < BREAKPOINTS.tablet) {
    return {
      breakpoint: "mobile",
      maxWidth: undefined,
      paddingHorizontal: 0,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    };
  }

  if (width < BREAKPOINTS.desktop) {
    return {
      breakpoint: "tablet",
      maxWidth: 720,
      paddingHorizontal: 16,
      isMobile: false,
      isTablet: true,
      isDesktop: false,
    };
  }

  return {
    breakpoint: "desktop",
    maxWidth: 960,
    paddingHorizontal: 24,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  };
}
