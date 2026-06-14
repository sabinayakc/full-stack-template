import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeOut, SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWebLayout } from "@/hooks/use-web-layout";
import { haptic } from "@/lib/haptics";
import { fonts, radius, spacing, useTheme } from "@/styles";

type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
};

type ToastContextValue = {
  toast: (type: ToastType, message: unknown, duration?: number) => void;
  success: (message: unknown, duration?: number) => void;
  error: (message: unknown) => void;
  info: (message: unknown, duration?: number) => void;
  warning: (message: unknown, duration?: number) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 3000;

let idCounter = 0;

function getToastColors(type: ToastType, isDark: boolean) {
  switch (type) {
    case "success":
      return {
        bg: isDark ? "#064e3b" : "#ecfdf5",
        border: isDark ? "#065f46" : "#a7f3d0",
        text: isDark ? "#6ee7b7" : "#065f46",
        icon: isDark ? "#34d399" : "#10b981",
      };
    case "error":
      return {
        bg: isDark ? "#450a0a" : "#fef2f2",
        border: isDark ? "#7f1d1d" : "#fecaca",
        text: isDark ? "#fca5a5" : "#991b1b",
        icon: isDark ? "#f87171" : "#ef4444",
      };
    case "warning":
      return {
        bg: isDark ? "#451a03" : "#fffbeb",
        border: isDark ? "#78350f" : "#fde68a",
        text: isDark ? "#fcd34d" : "#92400e",
        icon: isDark ? "#fbbf24" : "#f59e0b",
      };
    case "info":
      return {
        bg: isDark ? "#0c4a6e" : "#eff6ff",
        border: isDark ? "#075985" : "#bfdbfe",
        text: isDark ? "#7dd3fc" : "#1e40af",
        icon: isDark ? "#38bdf8" : "#3b82f6",
      };
  }
}

function getIconName(type: ToastType): string {
  switch (type) {
    case "success":
      return "check-circle";
    case "error":
      return "error";
    case "warning":
      return "warning";
    case "info":
      return "info";
  }
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const { isDark } = useTheme();
  const colors = getToastColors(toast.type, isDark);
  const MaterialIcons = require("@expo/vector-icons/MaterialIcons").default;

  return (
    <Animated.View
      entering={SlideInDown.duration(250).withInitialValues({ opacity: 0 })}
      exiting={FadeOut.duration(200)}
      style={[
        s.toast,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
      ]}
    >
      <MaterialIcons name={getIconName(toast.type)} size={20} color={colors.icon} />
      <Text style={[s.message, { color: colors.text }]} numberOfLines={3}>
        {toast.message}
      </Text>
      {toast.type === "error" && (
        <Pressable onPress={() => onDismiss(toast.id)} hitSlop={8}>
          <MaterialIcons name="close" size={18} color={colors.text} />
        </Pressable>
      )}
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const insets = useSafeAreaInsets();
  const { maxWidth } = useWebLayout();
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    for (const timer of timers.current.values()) {
      clearTimeout(timer);
    }
    timers.current.clear();
    setToasts([]);
  }, []);

  const toast = useCallback((type: ToastType, message: unknown, duration?: number) => {
    const id = `toast-${++idCounter}`;
    const text =
      typeof message === "string"
        ? message
        : message instanceof Error
          ? message.message
          : "Something went wrong.";
    const newToast: Toast = { id, type, message: text, duration };

    setToasts((prev) => [...prev.slice(-4), newToast]);

    if (type === "error") {
      haptic.error();
    } else if (type === "warning") {
      haptic.warning();
    } else if (type === "success") {
      haptic.success();
    }

    // Errors don't auto-dismiss
    if (type !== "error") {
      const ms = duration ?? DEFAULT_DURATION;
      const timer = setTimeout(() => {
        timers.current.delete(id);
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, ms);
      timers.current.set(id, timer);
    }
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (msg, dur) => toast("success", msg, dur),
      error: (msg) => toast("error", msg),
      info: (msg, dur) => toast("info", msg, dur),
      warning: (msg, dur) => toast("warning", msg, dur),
      dismiss,
      dismissAll,
    }),
    [toast, dismiss, dismissAll],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <View
          style={[
            s.container,
            { bottom: insets.bottom + spacing.sm },
            Platform.OS === "web" && {
              maxWidth,
              alignSelf: "center" as const,
              left: 0,
              right: 0,
              marginHorizontal: "auto" as unknown as number,
            },
          ]}
          pointerEvents="box-none"
        >
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

const s = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    gap: spacing.sm,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.15)",
    elevation: 4,
  },
  message: {
    flex: 1,
    flexShrink: 1,
    fontSize: 13,
    fontFamily: fonts.medium,
    lineHeight: 18,
  },
});
