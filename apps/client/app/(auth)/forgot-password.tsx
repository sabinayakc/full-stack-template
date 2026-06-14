import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { AuthTextField } from "@/components/auth/auth-text-field";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth";
import { fonts, radius, useTheme } from "@/styles";

const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { colors: c } = useTheme();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setSubmitError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const result = await authClient.requestPasswordReset({
        email: values.email,
      });

      if (result.error) {
        setSubmitError(result.error.message ?? "Could not request a password reset");
        return;
      }

      setSuccessMessage("If an account exists for that email, we sent a reset link.");
    } catch {
      setSubmitError("Could not request a password reset");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenShell
      title="Reset your password"
      subtitle="We&apos;ll send you a secure reset link."
      prompt="Remembered your password?"
      actionHref="/(auth)/sign-in"
      actionLabel="Sign In"
    >
      {submitError ? (
        <View style={s.errorBanner}>
          <Text style={[s.smallText, { color: c.danger }]}>{submitError}</Text>
        </View>
      ) : null}

      {successMessage ? (
        <View style={s.successBanner}>
          <Text style={[s.smallText, { color: c.success }]}>{successMessage}</Text>
        </View>
      ) : null}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthTextField
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

      <Button
        variant="inverted"
        isLoading={loading}
        loadingText="Sending link..."
        onPress={handleSubmit(onSubmit)}
      >
        Send Reset Link
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
  successBanner: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.20)",
    backgroundColor: "rgba(16, 185, 129, 0.10)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
});
