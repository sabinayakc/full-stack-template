import type React from "react";
import { StyleSheet, TextInput, type TextInputProps, View, type ViewStyle } from "react-native";
import { FormField } from "@/components/ui/form-field";
import { fonts, radius, spacing, useTheme } from "@/styles";

type ThemedTextInputProps = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  rightAdornment?: React.ReactNode;
  containerStyle?: ViewStyle;
  surface?: "default" | "secondary";
  size?: "default" | "field" | "compact";
};

export function ThemedTextInput({
  label,
  hint,
  error,
  rightAdornment,
  containerStyle,
  surface = "default",
  size = "default",
  style,
  ...props
}: ThemedTextInputProps) {
  const { colors: c } = useTheme();
  const isMultiline = Boolean(props.multiline);
  const backgroundColor = surface === "secondary" ? c.bgSecondary : c.bg;

  return (
    <FormField label={label} hint={hint} error={error} style={containerStyle}>
      <View>
        <TextInput
          style={[
            size === "compact" ? s.inputCompact : size === "field" ? s.inputField : s.input,
            isMultiline ? s.inputMultiline : null,
            {
              color: c.text,
              backgroundColor,
              borderColor: error ? c.danger : c.border,
            },
            error ? { backgroundColor: `${c.danger}0D` } : null,
            rightAdornment ? s.inputWithAdornment : null,
            style,
          ]}
          placeholderTextColor={c.textSecondary}
          {...props}
        />
        {rightAdornment ? <View style={s.adornment}>{rightAdornment}</View> : null}
      </View>
    </FormField>
  );
}

const s = StyleSheet.create({
  input: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  inputCompact: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  inputField: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  inputMultiline: {
    height: undefined,
    minHeight: 96,
    paddingTop: 12,
    paddingBottom: 12,
  },
  inputWithAdornment: {
    paddingRight: 44,
  },
  adornment: {
    position: "absolute",
    right: 12,
    top: 12,
  },
});
