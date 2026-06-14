import { focusManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { AppState, Platform } from "react-native";

const QueryResetContext = createContext<() => void>(() => {});

export function useQueryReset() {
  return useContext(QueryResetContext);
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute
            retry: 2,
          },
        },
      }),
  );

  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = AppState.addEventListener("change", (state) => {
      focusManager.setFocused(state === "active");
    });
    return () => sub.remove();
  }, []);

  const resetQueries = () => {
    queryClient.removeQueries();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <QueryResetContext.Provider value={resetQueries}>{children}</QueryResetContext.Provider>
    </QueryClientProvider>
  );
}
