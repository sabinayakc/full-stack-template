import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { VERIFICATION_EMAIL_RESEND_COOLDOWN_SECONDS } from "@repo/shared";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { AuthTextField } from "@/components/auth/auth-text-field";
import { VerificationResendCard } from "@/components/auth/verification-resend-card";
import { Button } from "@/components/ui/button";
import { authClient, signIn } from "@/lib/auth";
import { fonts, radius, useTheme } from "@/styles";

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email")
    .max(255, "Email must be 255 characters or less"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(255, "Password must be 255 characters or less"),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignIn() {
  const { colors: c } = useTheme();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const emailValue = useWatch({ control, name: "email" }) ?? "";

  useEffect(() => {
    if (cooldownRemaining <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setCooldownRemaining((current) => (current > 1 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [cooldownRemaining]);

  function isEmailVerificationError(message: string, status?: number) {
    return status === 403 || /verify/i.test(message) || /email.*verified/i.test(message);
  }

  async function onSubmit(values: SignInValues) {
    setSubmitError(null);
    setVerificationMessage(null);
    setLoading(true);
    try {
      const result = await signIn.email(values);
      if ((result.data as { twoFactorRedirect?: boolean } | undefined)?.twoFactorRedirect) {
        router.replace("/(auth)/two-factor-verify");
        return;
      }
      if (result.error) {
        const message = result.error.message ?? "Invalid email or password";

        if (isEmailVerificationError(message, result.error.status)) {
          setVerificationEmail(values.email);
          setVerificationMessage(
            "Please verify your email address. We sent you a new verification link.",
          );
          setCooldownRemaining(VERIFICATION_EMAIL_RESEND_COOLDOWN_SECONDS);
          return;
        }

        setSubmitError(message);
      }
    } catch {
      setSubmitError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    const email = verificationEmail ?? emailValue.trim();
    if (!email) {
      setSubmitError("Enter your email to resend verification.");
      return;
    }

    setSubmitError(null);
    setResendLoading(true);

    try {
      const result = await authClient.sendVerificationEmail({
        email,
      });

      if (result.error) {
        setSubmitError(result.error.message ?? "Could not resend verification email");
        return;
      }

      setVerificationEmail(email);
      setVerificationMessage(`Verification email sent to ${email}.`);
      setCooldownRemaining(VERIFICATION_EMAIL_RESEND_COOLDOWN_SECONDS);
    } catch {
      setSubmitError("Could not resend verification email");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <AuthScreenShell
      title="Welcome back"
      subtitle="Sign in to continue."
      prompt="Don&apos;t have an account?"
      actionHref="/(auth)/sign-up"
      actionLabel="Sign Up"
    >
      {submitError ? (
        <View style={s.errorBanner}>
          <Text style={[s.errorText, { color: c.danger }]}>{submitError}</Text>
        </View>
      ) : null}

      {verificationMessage ? (
        <VerificationResendCard
          message={verificationMessage}
          cooldownRemaining={cooldownRemaining}
          resendLoading={resendLoading}
          onResend={handleResendVerification}
        />
      ) : null}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthTextField
            testID="signin-email"
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
            testID="signin-password"
            label="Password"
            error={errors.password?.message}
            placeholder="••••••••"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry={!showPassword}
            autoComplete="password"
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

      <View style={s.forgotRow}>
        <Link href="./forgot-password" asChild>
          <Pressable style={s.forgotBtn}>
            <Text style={s.forgotText}>Forgot password?</Text>
          </Pressable>
        </Link>
      </View>

      <Button
        testID="signin-submit"
        variant="inverted"
        isLoading={loading}
        loadingText="Signing in..."
        onPress={handleSubmit(onSubmit)}
      >
        Sign In
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
  forgotRow: {
    alignItems: "flex-end",
  },
  forgotBtn: {
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: "#0a7ea4",
  },
});
