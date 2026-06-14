import { setStatusBarStyle } from "expo-status-bar";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { type ColorSchemeName, useColorScheme as useSystemColorScheme } from "react-native";
import { storage } from "@/lib/storage";

type AppearanceMode = "system" | "light" | "dark";
type ResolvedScheme = "light" | "dark";

type AppearanceContextValue = {
  mode: AppearanceMode | null;
  setMode: (mode: AppearanceMode) => void;
  colorScheme: ResolvedScheme | null;
};

const STORAGE_KEY = "appearance-mode";

const AppearanceContext = createContext<AppearanceContextValue>({
  mode: null,
  setMode: () => {},
  colorScheme: null,
});

function resolveScheme(scheme: ColorSchemeName): ResolvedScheme {
  return scheme === "dark" ? "dark" : "light";
}

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [mode, setModeState] = useState<AppearanceMode | null>(null);

  useEffect(() => {
    storage.getItemAsync(STORAGE_KEY).then((stored) => {
      const valid: AppearanceMode[] = ["system", "light", "dark"];
      setModeState(
        valid.includes(stored as AppearanceMode) ? (stored as AppearanceMode) : "system",
      );
    });
  }, []);

  const setMode = useCallback((newMode: AppearanceMode) => {
    setModeState(newMode);
    storage.setItemAsync(STORAGE_KEY, newMode);
  }, []);

  const colorScheme: ResolvedScheme | null = mode === "system" ? resolveScheme(systemScheme) : mode;

  useEffect(() => {
    if (colorScheme) {
      setStatusBarStyle(colorScheme === "dark" ? "light" : "dark");
    }
  }, [colorScheme]);

  return (
    <AppearanceContext.Provider value={{ mode, setMode, colorScheme }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}
