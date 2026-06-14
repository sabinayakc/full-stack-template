import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  isPasswordPolicyValid,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_MESSAGE,
} from "@repo/shared";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { AuthTextField } from "@/components/auth/auth-text-field";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth";
import { useToast } from "@/providers/toast-provider";
import { fonts, radius, useTheme } from "@/styles";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
      .max(PASSWORD_MAX_LENGTH, `Password must be ${PASSWORD_MAX_LENGTH} characters or less`)
      .refine(isPasswordPolicyValid, PASSWORD_POLICY_MESSAGE),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { colors: c } = useTheme();
  const toast = useToast();
  const { token, error } = useLocalSearchParams<{ token?: string; error?: string }>();
  const [submitError, setSubmitError] = useState<string | null>(
    error === "INVALID_TOKEN" ? "This reset link is invalid or expired." : null,
  );
  const [redirecting, setRedirecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const passwordValue = useWatch({ control, name: "password" }) ?? "";

  async function onSubmit(values: ResetPasswordValues) {
    if (!token) {
      setSubmitError("This reset link is invalid or expired.");
      return;
    }

    setSubmitError(null);
    setLoading(true);

    try {
      const result = await authClient.resetPassword({
        token,
        newPassword: values.password,
      });

      if (result.error) {
        setSubmitError(result.error.message ?? "Could not reset your password");
        return;
      }

      toast.success("Password updated. Redirecting to sign in…");
      setRedirecting(true);
      router.replace("/(auth)/sign-in");
    } catch {
      setSubmitError("Could not reset your password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenShell
      title="Choose a new password"
      subtitle="Set a password you&apos;ll remember and others won&apos;t guess."
      prompt="Back to sign in?"
      actionHref="/(auth)/sign-in"
      actionLabel="Sign In"
    >
      {submitError ? (
        <View style={s.errorBanner}>
          <Text style={[s.smallText, { color: c.danger }]}>{submitError}</Text>
        </View>
      ) : null}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthTextField
            label="New Password"
            error={errors.password?.message}
            placeholder="••••••••"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            rightAdornment={
              <Pressable style={s.eyeBtn} onPress={() => setShowPassword((current) => !current)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  color="#6b7280"
                  size={18}
                />
              </Pressable>
            }
          />
        )}
      />

      <PasswordStrength password={passwordValue} />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthTextField
            label="Confirm Password"
            error={errors.confirmPassword?.message}
            placeholder="••••••••"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry={!showConfirmPassword}
            autoComplete="new-password"
            rightAdornment={
              <Pressable
                style={s.eyeBtn}
                onPress={() => setShowConfirmPassword((current) => !current)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  color="#6b7280"
                  size={18}
                />
              </Pressable>
            }
          />
        )}
      />

      <Button
        variant="inverted"
        isLoading={loading || redirecting}
        loadingText={redirecting ? "Redirecting..." : "Updating password..."}
        onPress={handleSubmit(onSubmit)}
        disabled={!token || redirecting}
      >
        Reset Password
      </Button>
    </AuthScreenShell>
  );
}

const s = StyleSheet.create({
  errorBanner: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.20)",
    backgroundColor: "rgba(239, 68, 68, 0.10)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  eyeBtn: {
    borderRadius: 6,
    padding: 4,
  },
});
