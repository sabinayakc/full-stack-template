import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { TwoFactorCodeInput } from "@/components/auth/two-factor-code-input";
import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { authClient } from "@/lib/auth";
import { fonts, radius, spacing, useTheme } from "@/styles";

type VerifyMethod = "totp" | "otp" | "sms";

const TABS: { key: VerifyMethod; label: string; icon: string }[] = [
  { key: "totp", label: "Authenticator", icon: "lock.app.dashed" },
  { key: "otp", label: "Email", icon: "envelope.fill" },
  { key: "sms", label: "Phone", icon: "phone.fill" },
];

export default function TwoFactorVerifyScreen() {
  const { colors: c } = useTheme();
  const [method, setMethod] = useState<VerifyMethod>("totp");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState<"email" | "sms" | false>(false);
  const [otpSending, setOtpSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showBackup, setShowBackup] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleTotpVerify = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authClient.twoFactor.verifyTotp({ code, trustDevice });
      if (result.error) {
        setError(result.error.message ?? "Invalid code");
      }
    } catch {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (channel: "email" | "sms" = "email") => {
    setOtpSending(true);
    setError(null);
    try {
      const result = await authClient.twoFactor.sendOtp({
        fetchOptions: { headers: { "x-otp-channel": channel } },
      });
      if (result.error) {
        setError(result.error.message ?? "Failed to send code");
        return;
      }
      setOtpSent(channel);
      setCooldown(60);
    } catch {
      setError("Failed to send code");
    } finally {
      setOtpSending(false);
    }
  };

  const handleOtpVerify = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authClient.twoFactor.verifyOtp({ code, trustDevice });
      if (result.error) {
        setError(result.error.message ?? "Invalid code");
      }
    } catch {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBackupVerify = async () => {
    if (!backupCode.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await authClient.twoFactor.verifyBackupCode({
        code: backupCode.trim(),
        trustDevice,
      });
      if (result.error) {
        setError(result.error.message ?? "Invalid backup code");
      }
    } catch {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: VerifyMethod) => {
    setMethod(tab);
    setError(null);
    setOtpSent(false);
    setShowBackup(false);
  };

  if (showBackup) {
    return (
      <AuthScreenShell
        title="Use Backup Code"
        subtitle="Enter one of your recovery codes to sign in"
        prompt="Return to"
        actionHref="/(auth)/sign-in"
        actionLabel="Sign In"
        headerContent={
          <View style={[s.iconCircle, { backgroundColor: `${c.warning}1A` }]}>
            <IconSymbol name="key.fill" size={32} color={c.warning} />
          </View>
        }
      >
        <View style={s.methodSection}>
          <TextInput
            testID="2fa-verify-backup-input"
            style={[
              s.backupInput,
              {
                color: c.text,
                borderColor: error ? c.danger : c.border,
                backgroundColor: c.surface,
              },
            ]}
            value={backupCode}
            onChangeText={(text) => {
              setBackupCode(text);
              setError(null);
            }}
            placeholder="Enter backup code"
            placeholderTextColor={c.muted}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          {error ? <Text style={[s.errorText, { color: c.danger }]}>{error}</Text> : null}
          <Button onPress={handleBackupVerify} isLoading={loading} disabled={!backupCode.trim()}>
            Verify
          </Button>
        </View>

        <Pressable
          style={s.fallbackLink}
          onPress={() => {
            setShowBackup(false);
            setError(null);
            setBackupCode("");
          }}
        >
          <Text style={[s.fallbackText, { color: c.primary }]}>Back to verification methods</Text>
        </Pressable>

        <Pressable style={s.trustRow} onPress={() => setTrustDevice((prev) => !prev)}>
          <View
            style={[
              s.checkbox,
              {
                borderColor: trustDevice ? c.primary : c.border,
                backgroundColor: trustDevice ? c.primary : "transparent",
              },
            ]}
          >
            {trustDevice ? <IconSymbol name="checkmark" size={12} color="#FFFFFF" /> : null}
          </View>
          <Text style={[s.trustText, { color: c.textSecondary }]}>
            Trust this device for 30 days
          </Text>
        </Pressable>
      </AuthScreenShell>
    );
  }

  return (
    <AuthScreenShell
      title="Two-Factor Verification"
      subtitle="Enter your verification code to continue"
      prompt="Return to"
      actionHref="/(auth)/sign-in"
      actionLabel="Sign In"
      headerContent={
        <View style={[s.iconCircle, { backgroundColor: `${c.primary}1A` }]}>
          <IconSymbol name="shield.lefthalf.filled" size={32} color={c.primary} />
        </View>
      }
    >
      <View style={[s.tabs, { borderColor: c.border, backgroundColor: c.surface }]}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            testID={`2fa-tab-${tab.key}`}
            style={[s.tab, method === tab.key && { backgroundColor: c.bg, borderColor: c.border }]}
            onPress={() => handleTabChange(tab.key)}
          >
            <IconSymbol
              name={tab.icon}
              size={14}
              color={method === tab.key ? c.primary : c.textSecondary}
            />
            <Text
              style={[
                s.tabText,
                { color: method === tab.key ? c.primary : c.textSecondary },
                method === tab.key && s.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={s.methodContent}>
        {method === "totp" ? (
          <View style={s.methodSection}>
            <Text style={[s.methodLabel, { color: c.textSecondary }]}>
              Enter the 6-digit code from your authenticator app
            </Text>
            <TwoFactorCodeInput
              testID="2fa-verify-totp"
              onComplete={handleTotpVerify}
              isLoading={loading}
              error={error}
            />
          </View>
        ) : null}

        {method === "otp" ? (
          <View style={s.methodSection}>
            {otpSent !== "email" ? (
              <>
                <Text style={[s.methodLabel, { color: c.textSecondary }]}>
                  We'll send a verification code to your email address
                </Text>
                <Button onPress={() => handleSendOtp("email")} isLoading={otpSending}>
                  Send Verification Code
                </Button>
              </>
            ) : (
              <>
                <Text style={[s.methodLabel, { color: c.textSecondary }]}>
                  Enter the code sent to your email
                </Text>
                <TwoFactorCodeInput
                  testID="2fa-verify-otp"
                  onComplete={handleOtpVerify}
                  isLoading={loading}
                  error={error}
                />
                <Button
                  variant="ghost"
                  onPress={() => handleSendOtp("email")}
                  disabled={cooldown > 0}
                  isLoading={otpSending}
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Code"}
                </Button>
              </>
            )}
          </View>
        ) : null}

        {method === "sms" ? (
          <View style={s.methodSection}>
            {otpSent !== "sms" ? (
              <>
                <Text style={[s.methodLabel, { color: c.textSecondary }]}>
                  We'll send a verification code to your phone number
                </Text>
                <Button onPress={() => handleSendOtp("sms")} isLoading={otpSending}>
                  Send Verification Code
                </Button>
              </>
            ) : (
              <>
                <Text style={[s.methodLabel, { color: c.textSecondary }]}>
                  Enter the code sent to your phone
                </Text>
                <TwoFactorCodeInput
                  testID="2fa-verify-sms"
                  onComplete={handleOtpVerify}
                  isLoading={loading}
                  error={error}
                />
                <Button
                  variant="ghost"
                  onPress={() => handleSendOtp("sms")}
                  disabled={cooldown > 0}
                  isLoading={otpSending}
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Code"}
                </Button>
              </>
            )}
          </View>
        ) : null}
      </View>

      <Pressable style={s.fallbackLink} onPress={() => setShowBackup(true)}>
        <IconSymbol name="key.fill" size={14} color={c.textSecondary} />
        <Text style={[s.fallbackText, { color: c.textSecondary }]}>
          Having trouble? Use a backup code
        </Text>
      </Pressable>

      <Pressable style={s.trustRow} onPress={() => setTrustDevice((prev) => !prev)}>
        <View
          style={[
            s.checkbox,
            {
              borderColor: trustDevice ? c.primary : c.border,
              backgroundColor: trustDevice ? c.primary : "transparent",
            },
          ]}
        >
          {trustDevice ? <IconSymbol name="checkmark" size={12} color="#FFFFFF" /> : null}
        </View>
        <Text style={[s.trustText, { color: c.textSecondary }]}>Trust this device for 30 days</Text>
      </Pressable>
    </AuthScreenShell>
  );
}

const s = StyleSheet.create({
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  tabs: {
    flexDirection: "row",
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 3,
    gap: 3,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  tabText: {
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  tabTextActive: {
    fontFamily: fonts.semibold,
  },
  methodContent: {
    minHeight: 160,
  },
  methodSection: {
    gap: spacing.lg,
  },
  methodLabel: {
    fontSize: 14,
    fontFamily: fonts.regular,
    textAlign: "center",
    lineHeight: 20,
  },
  backupInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    fontFamily: "monospace",
    textAlign: "center",
    letterSpacing: 1,
  },
  errorText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    textAlign: "center",
  },
  fallbackLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.sm,
  },
  fallbackText: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  trustText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
});
