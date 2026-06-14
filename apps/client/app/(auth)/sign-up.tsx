import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  isPasswordPolicyValid,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_MESSAGE,
} from "@repo/shared";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { AuthTextField } from "@/components/auth/auth-text-field";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";
import { signUp } from "@/lib/auth";
import { fonts, radius, useTheme } from "@/styles";

const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
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

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const router = useRouter();
  const { colors: c } = useTheme();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const passwordValue = useWatch({ control, name: "password" }) ?? "";

  async function onSubmit(values: SignUpValues) {
    setSubmitError(null);
    setLoading(true);
    try {
      const result = await signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (result.error) {
        setSubmitError(result.error.message ?? "Could not create account");
        return;
      }

      router.replace(`/(auth)/verify-email?email=${encodeURIComponent(values.email)}` as never);
    } catch {
      setSubmitError("Could not create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenShell
      title="Create your account"
      subtitle="Get started with the app."
      prompt="Already have an account?"
      actionHref="/(auth)/sign-in"
      actionLabel="Sign In"
    >
      {submitError ? (
        <View style={s.errorBanner}>
          <Text style={[s.errorText, { color: c.danger }]}>{submitError}</Text>
        </View>
      ) : null}

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthTextField
            testID="signup-name"
            label="Name"
            error={errors.name?.message}
            placeholder="John Doe"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoComplete="name"
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthTextField
            testID="signup-email"
            label="Email"
            error={errors.email?.message}
            placeholder="you@example.com"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthTextField
            testID="signup-password"
            label="Password"
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

      <PasswordStrength password={passwordValue} minimal />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthTextField
            testID="signup-confirm-password"
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
        testID="signup-submit"
        variant="inverted"
        isLoading={loading}
        loadingText="Creating account..."
        onPress={handleSubmit(onSubmit)}
      >
        Create Account
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
  errorText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  eyeBtn: {
    borderRadius: 6,
    padding: 4,
  },
});
