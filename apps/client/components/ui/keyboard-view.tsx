import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, type ViewStyle } from "react-native";

type KeyboardViewProps = PropsWithChildren<{
  style?: ViewStyle;
  keyboardVerticalOffset?: number;
}>;

export function KeyboardView({ children, style, keyboardVerticalOffset }: KeyboardViewProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[{ flex: 1 }, style]}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
