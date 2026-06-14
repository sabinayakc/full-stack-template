import { useAppearance } from "@/providers/appearance-provider";

export const BrandColor = "#163eff";

export const colors = {
  light: {
    bg: "#ffffff",
    bgSecondary: "#f2f2f7",
    surface: "#f3f4f6",
    text: "#11181c",
    textSecondary: "#787f85",
    border: "#e6e8ec",
    primary: "#0ea5e9",
    primaryMuted: "rgba(14, 165, 233, 0.15)",
    primarySubtle: "rgba(14, 165, 233, 0.10)",
    semiTransparent: "rgba(255, 255, 255, 0.75)",
    danger: "#ef4444",
    success: "#10b981",
    warning: "#f59e0b",
    accent: "#f59e0b",
    muted: "#6b7280",
  },
  dark: {
    bg: "#151718",
    bgSecondary: "#1c1c1e",
    surface: "#202225",
    text: "#ecedee",
    textSecondary: "#9ba1a6",
    border: "#30343a",
    primary: "#38bdf8",
    primaryMuted: "rgba(56, 189, 248, 0.15)",
    primarySubtle: "rgba(56, 189, 248, 0.10)",
    semiTransparent: "rgba(21, 23, 24, 0.75)",
    danger: "#f87171",
    success: "#34d399",
    warning: "#fbbf24",
    accent: "#fbbf24",
    muted: "#8e8e93",
  },
} satisfies Record<string, Record<string, string>>;

export const fonts = {
  thin: "Inter_100Thin",
  extralight: "Inter_200ExtraLight",
  light: "Inter_300Light",
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extrabold: "Inter_800ExtraBold",
  black: "Inter_900Black",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export type ThemeColors = (typeof colors)["light"];

export function useTheme() {
  const { colorScheme } = useAppearance();
  const isDark = colorScheme === "dark";
  return {
    colors: isDark ? colors.dark : colors.light,
    fonts,
    spacing,
    radius,
    isDark,
  };
}
