import { useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { AppModal } from "@/components/ui/app-modal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { haptic } from "@/lib/haptics";
import { fonts, radius, spacing, useTheme } from "@/styles";
import type { ThemeColors } from "@/styles/theme";

type ConfirmVariant = "default" | "danger" | "warning" | "info";

const VARIANT_CONFIG: Record<ConfirmVariant, { icon: string; colorKey: keyof ThemeColors }> = {
  default: { icon: "", colorKey: "primary" },
  danger: { icon: "exclamationmark.circle.fill", colorKey: "danger" },
  warning: { icon: "exclamationmark.triangle.fill", colorKey: "accent" },
  info: { icon: "info.circle.fill", colorKey: "primary" },
};

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  showCancel?: boolean;
  dismissable?: boolean;
};

type ConfirmInputOptions = ConfirmOptions & {
  requiredText: string;
  inputLabel?: string;
};

type PendingConfirm = ConfirmOptions & {
  resolve: (value: boolean | null) => void;
};

type PendingConfirmInput = ConfirmInputOptions & {
  resolve: (value: boolean | null) => void;
};

type PromptOptions = {
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  secureTextEntry?: boolean;
};

type PendingPrompt = PromptOptions & {
  resolve: (value: string | null) => void;
};

let listener: ((pending: PendingConfirm) => void) | null = null;
let inputListener: ((pending: PendingConfirmInput) => void) | null = null;
let promptListener: ((pending: PendingPrompt) => void) | null = null;

export function confirm(options: ConfirmOptions): Promise<boolean | null> {
  return new Promise((resolve) => {
    if (listener) {
      listener({ ...options, resolve });
    } else {
      resolve(false);
    }
  });
}

export function confirmWithInput(options: ConfirmInputOptions): Promise<boolean | null> {
  return new Promise((resolve) => {
    if (inputListener) {
      inputListener({ ...options, resolve });
    } else {
      resolve(false);
    }
  });
}

export function prompt(options: PromptOptions): Promise<string | null> {
  return new Promise((resolve) => {
    if (promptListener) {
      promptListener({ ...options, resolve });
    } else {
      resolve(null);
    }
  });
}

function VariantIcon({ variant, color }: { variant: ConfirmVariant; color: string }) {
  const config = VARIANT_CONFIG[variant];
  if (!config.icon) return null;
  return (
    <View style={s.iconContainer}>
      <IconSymbol name={config.icon} size={32} color={color} />
    </View>
  );
}

export function ConfirmDialog() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const { colors: c } = useTheme();

  useEffect(() => {
    listener = setPending;
    return () => {
      listener = null;
    };
  }, []);

  const handleConfirm = useCallback(() => {
    haptic.success();
    pending?.resolve(true);
    setPending(null);
  }, [pending]);

  const handleCancel = useCallback(() => {
    haptic.light();
    pending?.resolve(false);
    setPending(null);
  }, [pending]);

  const handleDismiss = useCallback(() => {
    haptic.light();
    pending?.resolve(null);
    setPending(null);
  }, [pending]);

  if (!pending) return null;

  const variant = pending.variant ?? "default";
  const variantColor = c[VARIANT_CONFIG[variant].colorKey];
  const showCancel = pending.showCancel ?? true;
  const dismissable = pending.dismissable ?? false;

  return (
    <AppModal transparent statusBarTranslucent animationType="none" visible>
      <Animated.View
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(150)}
        style={s.overlay}
      >
        {dismissable ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />
        ) : (
          <View style={StyleSheet.absoluteFill} />
        )}
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          style={[s.dialog, { backgroundColor: c.bg, borderColor: c.border }]}
        >
          {dismissable ? (
            <Pressable style={s.dismissBtn} onPress={handleDismiss} hitSlop={8}>
              <IconSymbol name="xmark" size={16} color={c.textSecondary} />
            </Pressable>
          ) : null}
          <View style={s.body}>
            <VariantIcon variant={variant} color={variantColor} />
            <Text style={[s.title, { color: c.text }]}>{pending.title}</Text>
            <Text style={[s.message, { color: c.textSecondary }]}>{pending.message}</Text>
          </View>

          <View style={[s.actions, { borderTopColor: c.border }]}>
            {showCancel ? (
              <Pressable
                onPress={handleCancel}
                style={[s.btn, { borderRightColor: c.border, borderRightWidth: 1 }]}
              >
                <Text style={[s.btnText, { color: c.textSecondary }]}>
                  {pending.cancelLabel ?? "Cancel"}
                </Text>
              </Pressable>
            ) : null}
            <Pressable onPress={handleConfirm} style={s.btn}>
              <Text style={[s.btnText, s.btnTextConfirm, { color: variantColor }]}>
                {pending.confirmLabel ?? "Confirm"}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </AppModal>
  );
}

export function ConfirmInputDialog() {
  const [pending, setPending] = useState<PendingConfirmInput | null>(null);
  const [inputValue, setInputValue] = useState("");
  const { colors: c } = useTheme();

  useEffect(() => {
    inputListener = setPending;
    return () => {
      inputListener = null;
    };
  }, []);

  // Reset input when a new dialog opens
  useEffect(() => {
    if (pending) setInputValue("");
  }, [pending]);

  const handleConfirm = useCallback(() => {
    haptic.success();
    pending?.resolve(true);
    setPending(null);
    setInputValue("");
  }, [pending]);

  const handleCancel = useCallback(() => {
    haptic.light();
    pending?.resolve(false);
    setPending(null);
    setInputValue("");
  }, [pending]);

  if (!pending) return null;

  const variant = pending.variant ?? "danger";
  const variantColor = c[VARIANT_CONFIG[variant].colorKey];
  const isMatch = inputValue.trim().toLowerCase() === pending.requiredText.trim().toLowerCase();

  return (
    <AppModal transparent statusBarTranslucent animationType="none" visible>
      <KeyboardAvoidingView
        style={s.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          style={s.overlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} />
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(150)}
            style={[s.dialog, { backgroundColor: c.bg, borderColor: c.border }]}
          >
            <View style={s.body}>
              <VariantIcon variant={variant} color={variantColor} />
              <Text style={[s.title, { color: c.text }]}>{pending.title}</Text>
              <Text style={[s.message, { color: c.textSecondary }]}>{pending.message}</Text>
              <View style={s.inputSection}>
                <Text style={[s.inputLabel, { color: c.textSecondary }]}>
                  {pending.inputLabel ?? `Type "${pending.requiredText}" to confirm`}
                </Text>
                <TextInput
                  style={[
                    s.textInput,
                    {
                      color: c.text,
                      borderColor: inputValue.length > 0 && !isMatch ? c.danger : c.border,
                      backgroundColor: c.surface,
                    },
                  ]}
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder={pending.requiredText}
                  placeholderTextColor={c.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
              </View>
            </View>

            <View style={[s.actions, { borderTopColor: c.border }]}>
              <Pressable
                onPress={handleCancel}
                style={[s.btn, { borderRightColor: c.border, borderRightWidth: 1 }]}
              >
                <Text style={[s.btnText, { color: c.textSecondary }]}>
                  {pending.cancelLabel ?? "Cancel"}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                style={[s.btn, { opacity: isMatch ? 1 : 0.4 }]}
                disabled={!isMatch}
              >
                <Text style={[s.btnText, s.btnTextConfirm, { color: variantColor }]}>
                  {pending.confirmLabel ?? "Confirm"}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </AppModal>
  );
}

export function PromptDialog() {
  const [pending, setPending] = useState<PendingPrompt | null>(null);
  const [inputValue, setInputValue] = useState("");
  const { colors: c } = useTheme();

  useEffect(() => {
    promptListener = setPending;
    return () => {
      promptListener = null;
    };
  }, []);

  useEffect(() => {
    if (pending) setInputValue(pending.defaultValue ?? "");
  }, [pending]);

  const handleConfirm = useCallback(() => {
    haptic.success();
    pending?.resolve(inputValue.trim());
    setPending(null);
    setInputValue("");
  }, [pending, inputValue]);

  const handleCancel = useCallback(() => {
    haptic.light();
    pending?.resolve(null);
    setPending(null);
    setInputValue("");
  }, [pending]);

  if (!pending) return null;

  return (
    <AppModal transparent statusBarTranslucent animationType="none" visible>
      <KeyboardAvoidingView
        style={s.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          style={s.overlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} />
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(150)}
            style={[s.dialog, { backgroundColor: c.bg, borderColor: c.border }]}
          >
            <View style={s.body}>
              <Text style={[s.title, { color: c.text }]}>{pending.title}</Text>
              {pending.message ? (
                <Text style={[s.message, { color: c.textSecondary }]}>{pending.message}</Text>
              ) : null}
              <View style={s.inputSection}>
                <TextInput
                  style={[
                    s.textInput,
                    {
                      color: c.text,
                      borderColor: c.border,
                      backgroundColor: c.surface,
                      textAlign: "left",
                    },
                  ]}
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder={pending.placeholder}
                  placeholderTextColor={c.muted}
                  secureTextEntry={pending.secureTextEntry}
                  autoFocus
                  selectTextOnFocus
                />
              </View>
            </View>

            <View style={[s.actions, { borderTopColor: c.border }]}>
              <Pressable
                onPress={handleCancel}
                style={[s.btn, { borderRightColor: c.border, borderRightWidth: 1 }]}
              >
                <Text style={[s.btnText, { color: c.textSecondary }]}>
                  {pending.cancelLabel ?? "Cancel"}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                style={[s.btn, { opacity: inputValue.trim() ? 1 : 0.4 }]}
                disabled={!inputValue.trim()}
              >
                <Text style={[s.btnText, s.btnTextConfirm, { color: c.primary }]}>
                  {pending.confirmLabel ?? "Save"}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </AppModal>
  );
}

const s = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing["3xl"],
  },
  dialog: {
    width: "100%",
    maxWidth: 320,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.25)",
    elevation: 8,
  },
  body: {
    paddingTop: spacing["2xl"],
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing["2xl"],
    gap: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    fontFamily: fonts.regular,
    textAlign: "center",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
  },
  btn: {
    flex: 1,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    textAlign: "center",
  },
  btnTextConfirm: {
    fontFamily: fonts.semibold,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  dismissBtn: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 1,
    padding: spacing.xs,
  },
  inputSection: {
    width: "100%",
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: fonts.medium,
    textAlign: "center",
  },
  textInput: {
    width: "100%",
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    fontFamily: fonts.regular,
    textAlign: "center",
  },
});
