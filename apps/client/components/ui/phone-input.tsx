import { TextInput, type TextInputProps, type ViewStyle } from "react-native";
import { FormField } from "@/components/ui/form-field";
import { fonts, radius, spacing, useTheme } from "@/styles";

function formatUSPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function extractDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

type PhoneInputProps = Omit<TextInputProps, "value" | "onChangeText" | "keyboardType"> & {
  value: string;
  onChangeText: (formatted: string, digits: string) => void;
  label?: string;
  hint?: string;
  error?: string;
  containerStyle?: ViewStyle;
  surface?: "default" | "secondary";
};

export function PhoneInput({
  value,
  onChangeText,
  label,
  hint,
  error,
  containerStyle,
  surface = "default",
  style,
  ...props
}: PhoneInputProps) {
  const { colors: c } = useTheme();
  const backgroundColor = surface === "secondary" ? c.bgSecondary : c.bg;

  const handleChangeText = (text: string) => {
    const digits = extractDigits(text);
    onChangeText(formatUSPhone(digits), digits);
  };

  return (
    <FormField label={label} hint={hint} error={error} style={containerStyle}>
      <TextInput
        style={[
          {
            height: 48,
            borderRadius: radius.lg,
            borderWidth: 1,
            paddingHorizontal: spacing.lg,
            fontSize: 16,
            fontFamily: fonts.regular,
            color: c.text,
            backgroundColor,
            borderColor: error ? c.danger : c.border,
          },
          error ? { backgroundColor: `${c.danger}0D` } : null,
          style,
        ]}
        placeholderTextColor={c.textSecondary}
        placeholder="(555) 123-4567"
        value={formatUSPhone(value)}
        onChangeText={handleChangeText}
        keyboardType="phone-pad"
        {...props}
      />
    </FormField>
  );
}
