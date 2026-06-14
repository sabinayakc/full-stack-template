import type React from "react";
import type { TextInputProps, ViewStyle } from "react-native";
import { ThemedTextInput } from "@/components/ui/themed-text-input";

type AuthTextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  rightAdornment?: React.ReactNode;
  containerStyle?: ViewStyle;
};

export function AuthTextField({
  label,
  error,
  rightAdornment,
  containerStyle,
  ...props
}: AuthTextFieldProps) {
  return (
    <ThemedTextInput
      label={label}
      error={error}
      rightAdornment={rightAdornment}
      containerStyle={containerStyle}
      {...props}
    />
  );
}
