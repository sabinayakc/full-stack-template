import { VERIFICATION_EMAIL_RESEND_COOLDOWN_SECONDS } from "@repo/shared";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { VerificationResendCard } from "@/components/auth/verification-resend-card";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth";
import { fonts, radius, useTheme } from "@/styles";

export default function VerifyEmail() {
  const { colors: c } = useTheme();
  const { token, email } = useLocalSearchParams<{ token?: string; email?: string }>();
  const [status, setStatus] = useState<"loading" | "waiting" | "success" | "error">(
    token ? "loading" : "waiting",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(
    token ? 0 : VERIFICATION_EMAIL_RESEND_COOLDOWN_SECONDS,
  );

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const id = setInterval(() => {
      setCooldownRemaining((c) => (c > 1 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownRemaining]);

  useEffect(() => {
    if (!token) return;

    setStatus("loading");
    let cancelled = false;

    async function verify() {
      try {
        const result = await authClient.verifyEmail({ query: { token: token! } });
        if (cancelled) return;
        if (result.error) {
          setStatus("error");
          setErrorMessage(result.error.message ?? "Could not verify your email.");
        } else {
          setStatus("success");
        }
      } catch {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage("Could not verify your email.");
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleResend() {
    if (!email) return;
    setResendLoading(true);
    try {
      const result = await authClient.sendVerificationEmail({ email });
      if (result.error) {
        setErrorMessage(result.error.message ?? "Could not resend verification email");
      } else {
        setCooldownRemaining(VERIFICATION_EMAIL_RESEND_COOLDOWN_SECONDS);
        setErrorMessage(null);
      }
    } catch {
      setErrorMessage("Could not resend verification email");
    } finally {
      setResendLoading(false);
    }
  }

  const subtitle =
    status === "loading"
      ? "Verifying your email..."
      : status === "waiting"
        ? "Check your inbox"
        : status === "success"
          ? "Your email has been verified."
          : "Verification failed.";

  return (
    <AuthScreenShell
      title="Email Verification"
      subtitle={subtitle}
      prompt="Back to sign in?"
      actionHref="/(auth)/sign-in"
      actionLabel="Sign In"
    >
      {status === "loading" ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={[s.loadingText, { color: "#6b7280" }]}>Verifying your email address...</Text>
        </View>
      ) : null}

      {status === "waiting" && email ? (
        <VerificationResendCard
          message={`Verification email sent to ${email}. Please check your inbox.`}
          cooldownRemaining={cooldownRemaining}
          resendLoading={resendLoading}
          onResend={handleResend}
          secondaryActionLabel="Back to sign up"
          onSecondaryAction={() => router.replace("/(auth)/sign-up")}
        />
      ) : null}

      {status === "success" ? (
        <View style={s.successBanner}>
          <Text style={[s.smallText, { color: c.success }]}>
            Your email has been verified. You can now sign in.
          </Text>
          <Button variant="inverted" onPress={() => router.replace("/(auth)/sign-in")}>
            Go To Sign In
          </Button>
        </View>
      ) : null}

      {status === "error" ? (
        <View style={s.errorBanner}>
          <Text style={[s.smallText, { color: c.danger }]}>
            {errorMessage ?? "This verification link is invalid or expired."}
          </Text>
          <Button variant="inverted" onPress={() => router.replace("/(auth)/sign-in")}>
            Go To Sign In
          </Button>
        </View>
      ) : null}
    </AuthScreenShell>
  );
}

const s = StyleSheet.create({
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  successBanner: {
    gap: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.20)",
    backgroundColor: "rgba(16, 185, 129, 0.10)",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  errorBanner: {
    gap: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.20)",
    backgroundColor: "rgba(239, 68, 68, 0.10)",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  smallText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
});
