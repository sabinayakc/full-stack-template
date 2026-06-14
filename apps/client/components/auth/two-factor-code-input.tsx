import { useCallback, useEffect, useRef, useState } from "react";
import {
  type NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  type TextInputKeyPressEventData,
  View,
} from "react-native";
import { fonts, radius, spacing, useTheme } from "@/styles";

const CODE_LENGTH = 6;
const DIGIT_KEYS = ["d0", "d1", "d2", "d3", "d4", "d5"] as const;

interface TwoFactorCodeInputProps {
  onComplete: (code: string) => void;
  isLoading?: boolean;
  error?: string | null;
  testID?: string;
}

export function TwoFactorCodeInput({
  onComplete,
  isLoading,
  error,
  testID,
}: TwoFactorCodeInputProps) {
  const { colors: c } = useTheme();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const pendingCode = useRef<string | null>(null);

  useEffect(() => {
    if (pendingCode.current) {
      const code = pendingCode.current;
      pendingCode.current = null;
      onComplete(code);
    }
  });

  const handleChange = useCallback(
    (text: string, index: number) => {
      if (isLoading) return;

      const cleaned = text.replace(/\D/g, "");
      if (cleaned.length >= CODE_LENGTH) {
        const pasted = cleaned.slice(0, CODE_LENGTH).split("");
        setDigits(pasted);
        inputRefs.current[CODE_LENGTH - 1]?.focus();
        pendingCode.current = pasted.join("");
        return;
      }

      const digit = cleaned.slice(-1);
      const next = [...digits];
      next[index] = digit;
      setDigits(next);

      if (digit && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      if (digit && index === CODE_LENGTH - 1) {
        if (next.every((d) => d !== "")) {
          pendingCode.current = next.join("");
        }
      }
    },
    [isLoading, digits],
  );

  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
      if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setDigits((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
      }
    },
    [digits],
  );

  useEffect(() => {
    if (error) {
      setDigits(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    }
  }, [error]);

  return (
    <View testID={testID}>
      <View style={s.row}>
        {DIGIT_KEYS.map((dk, i) => (
          <TextInput
            key={dk}
            ref={(ref) => {
              inputRefs.current[i] = ref;
            }}
            testID={testID ? `${testID}-digit-${i}` : undefined}
            style={[
              s.digitInput,
              {
                color: c.text,
                borderColor: error ? c.danger : digits[i] ? c.primary : c.border,
                backgroundColor: c.surface,
              },
            ]}
            value={digits[i]}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            keyboardType="number-pad"
            maxLength={i === 0 ? CODE_LENGTH : 1}
            editable={!isLoading}
            selectTextOnFocus
            autoFocus={i === 0}
          />
        ))}
      </View>
      {error ? <Text style={[s.errorText, { color: c.danger }]}>{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
  digitInput: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderRadius: radius.md,
    fontSize: 24,
    fontFamily: fonts.semibold,
    textAlign: "center",
  },
  errorText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
