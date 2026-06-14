import { PASSWORD_POLICY_MESSAGE, PASSWORD_RECOMMENDATION_MESSAGE } from "@repo/shared";
import { StyleSheet, Text, View } from "react-native";
import { fonts, useTheme } from "@/styles";

type PasswordStrengthProps = {
  password: string;
  minimal?: boolean;
};

type StrengthTone = "muted" | "danger" | "warning" | "success";

type StrengthResult = {
  score: number;
  label: string;
  hint: string;
  tone: StrengthTone;
};

function getStrengthResult(password: string): StrengthResult {
  if (!password) {
    return {
      score: 0,
      label: "Add a password",
      hint: "Use at least 8 characters.",
      tone: "muted",
    };
  }

  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (password.length < 8) {
    return {
      score: 1,
      label: "Too short",
      hint: "Use at least 8 characters.",
      tone: "danger",
    };
  }

  if (score <= 2) {
    return {
      score: 1,
      label: "Weak",
      hint: "Try adding uppercase letters, numbers, or symbols.",
      tone: "danger",
    };
  }

  if (score === 3) {
    return {
      score: 2,
      label: "Fair",
      hint: "A little more variety will make it stronger.",
      tone: "warning",
    };
  }

  if (score === 4) {
    return {
      score: 3,
      label: "Good",
      hint: "Good balance. A symbol or longer phrase would strengthen it further.",
      tone: "success",
    };
  }

  return {
    score: 4,
    label: "Strong",
    hint: "Strong password.",
    tone: "success",
  };
}

function getToneColors(tone: StrengthTone, c: ReturnType<typeof useTheme>["colors"]) {
  switch (tone) {
    case "danger":
      return { active: c.danger, label: c.danger };
    case "warning":
      return { active: c.accent, label: c.accent };
    case "success":
      return { active: c.success, label: c.success };
    default:
      return { active: c.border, label: c.textSecondary };
  }
}

export function PasswordStrength({ password, minimal = false }: PasswordStrengthProps) {
  const { colors: c } = useTheme();
  const result = getStrengthResult(password);
  const tone = getToneColors(result.tone, c);

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        {!minimal ? (
          <Text style={[s.caption, { color: c.textSecondary }]}>Password strength</Text>
        ) : (
          <View />
        )}
        <Text style={[s.labelText, { color: tone.label }]}>{result.label}</Text>
      </View>

      <View style={s.barRow}>
        {Array.from({ length: 4 }).map((_, index) => {
          const isActive = index < result.score;
          return (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: Static segment list.
              key={index}
              style={[
                s.barSegment,
                {
                  backgroundColor: isActive ? tone.active : `${c.border}99`,
                },
              ]}
            />
          );
        })}
      </View>

      {!minimal ? (
        <View style={s.headerRow}>
          <Text style={[s.caption, { color: c.textSecondary }]}>{result.hint}</Text>
        </View>
      ) : null}

      {!minimal ? (
        <>
          <Text style={[s.caption, { color: c.textSecondary }]}>
            Required: {PASSWORD_POLICY_MESSAGE}
          </Text>
          <Text style={[s.caption, { color: c.textSecondary }]}>
            {PASSWORD_RECOMMENDATION_MESSAGE}
          </Text>
        </>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  caption: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  labelText: {
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  barRow: {
    flexDirection: "row",
    gap: 8,
  },
  barSegment: {
    height: 6,
    flex: 1,
    borderRadius: 9999,
  },
});
