import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { BackupCodesDisplay } from "@/components/auth/backup-codes-display";
import { TwoFactorCodeInput } from "@/components/auth/two-factor-code-input";
import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { KeyboardView } from "@/components/ui/keyboard-view";
import { StepWizard, type StepWizardHelpers } from "@/components/ui/step-wizard";
import { authClient } from "@/lib/auth";
import { useToast } from "@/providers/toast-provider";
import { fonts, radius, spacing, useTheme } from "@/styles";

type TwoFactorMethod = "totp" | "otp";

const METHOD_OPTIONS: { key: TwoFactorMethod; icon: string; title: string; description: string }[] =
  [
    {
      key: "totp",
      icon: "lock.app.dashed",
      title: "Authenticator App",
      description: "Use an app like Google Authenticator or Authy to generate codes",
    },
    {
      key: "otp",
      icon: "envelope.fill",
      title: "Email",
      description: "Receive a one-time code via email each time you sign in",
    },
  ];

export default function TwoFactorSetupScreen() {
  const { colors: c } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isReconfigure = mode === "reconfigure";
  const helpersRef = useRef<StepWizardHelpers | null>(null);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<TwoFactorMethod>("totp");
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const totpVerifiedRef = useRef(false);
  const [codesAcknowledged, setCodesAcknowledged] = useState(false);

  const secretKey = totpURI ? (new URL(totpURI).searchParams.get("secret") ?? "") : "";

  const handleCopySecret = async () => {
    await Clipboard.setStringAsync(secretKey);
    toast.success("Secret key copied");
  };

  const handleVerifyTotp = async (code: string) => {
    setVerifying(true);
    setVerifyError(null);
    try {
      const result = await authClient.twoFactor.verifyTotp({ code });
      if (result.error) {
        setVerifyError(result.error.message ?? "Invalid code. Try again.");
        return;
      }
      totpVerifiedRef.current = true;
      helpersRef.current?.goNext();
    } catch {
      setVerifyError("Verification failed. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  const totpStep = {
    id: "totp",
    title: isReconfigure ? "Reconfigure Authenticator" : "Set Up Authenticator",
    subtitle: "Scan the QR code with your authenticator app, then enter the 6-digit code",
    content: (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={s.stepContent}
        contentContainerStyle={s.totpContent}
      >
        {totpURI ? (
          <View style={[s.qrContainer, { backgroundColor: "#FFFFFF", borderColor: c.border }]}>
            <QRCode value={totpURI} size={200} />
          </View>
        ) : null}

        {secretKey ? (
          <View style={s.secretSection}>
            <Text style={[s.secretLabel, { color: c.textSecondary }]}>
              Or enter this key manually:
            </Text>
            <Pressable style={[s.secretRow, { borderColor: c.border }]} onPress={handleCopySecret}>
              <Text style={[s.secretText, { color: c.text }]} selectable>
                {secretKey}
              </Text>
              <IconSymbol name="doc.on.doc" size={16} color={c.primary} />
            </Pressable>
          </View>
        ) : null}

        <View style={s.verifySection}>
          <Text style={[s.verifyLabel, { color: c.textSecondary }]}>
            Enter the 6-digit code from your app:
          </Text>
          <TwoFactorCodeInput
            testID="2fa-setup-code"
            onComplete={handleVerifyTotp}
            isLoading={verifying}
            error={verifyError}
          />
        </View>
      </ScrollView>
    ),
    validate: async () => {
      if (totpVerifiedRef.current) return true;
      return "Please verify the code from your authenticator app";
    },
  };

  const reconfigureSteps = [
    {
      id: "password",
      title: "Verify Your Identity",
      subtitle: "Enter your current password to continue",
      content: (
        <View style={s.stepContent}>
          <TextInput
            testID="2fa-setup-password"
            style={[
              s.passwordInput,
              {
                color: c.text,
                borderColor: passwordError ? c.danger : c.border,
                backgroundColor: c.surface,
              },
            ]}
            placeholder="Enter your password"
            placeholderTextColor={c.muted}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError(null);
            }}
            secureTextEntry
            autoFocus
          />
          {passwordError ? (
            <Text style={[s.errorText, { color: c.danger }]}>{passwordError}</Text>
          ) : null}
        </View>
      ),
      validate: async () => {
        if (!password.trim()) return "Please enter your password";
        try {
          const result = await authClient.twoFactor.getTotpUri({ password });
          if (result.error) {
            setPasswordError(result.error.message ?? "Incorrect password");
            return result.error.message ?? "Incorrect password";
          }
          setTotpURI(result.data?.totpURI ?? null);
          return true;
        } catch {
          setPasswordError("Failed to load authenticator. Try again.");
          return "Failed to load authenticator";
        }
      },
    },
    totpStep,
    {
      id: "success",
      title: "Authenticator Updated",
      subtitle: "Your new authenticator app is now linked to your account",
      content: (
        <View style={[s.stepContent, s.successContent]}>
          <View style={[s.successIcon, { backgroundColor: `${c.success}1A` }]}>
            <IconSymbol name="checkmark.shield.fill" size={48} color={c.success} />
          </View>
          <Text style={[s.successText, { color: c.textSecondary }]}>
            You can now use your new authenticator app to verify your identity when signing in.
          </Text>
        </View>
      ),
    },
  ];

  const freshSetupSteps = [
    {
      id: "password",
      title: "Verify Your Identity",
      subtitle: "Enter your current password to continue",
      content: (
        <View style={s.stepContent}>
          <TextInput
            testID="2fa-setup-password"
            style={[
              s.passwordInput,
              {
                color: c.text,
                borderColor: passwordError ? c.danger : c.border,
                backgroundColor: c.surface,
              },
            ]}
            placeholder="Enter your password"
            placeholderTextColor={c.muted}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError(null);
            }}
            secureTextEntry
            autoFocus
          />
          {passwordError ? (
            <Text style={[s.errorText, { color: c.danger }]}>{passwordError}</Text>
          ) : null}
        </View>
      ),
      validate: async () => {
        if (!password.trim()) return "Please enter your password";
        try {
          const result = await authClient.twoFactor.enable({ password });
          if (result.error) {
            setPasswordError(result.error.message ?? "Incorrect password");
            return result.error.message ?? "Incorrect password";
          }
          setTotpURI(result.data?.totpURI ?? null);
          setBackupCodes(result.data?.backupCodes ?? []);
          return true;
        } catch {
          setPasswordError("Failed to enable 2FA. Try again.");
          return "Failed to enable 2FA";
        }
      },
    },
    {
      id: "method",
      title: "Choose Your Method",
      subtitle: "How would you like to verify your identity when signing in?",
      content: (
        <View style={s.stepContent}>
          <View style={s.methodOptions}>
            {METHOD_OPTIONS.map((m) => (
              <Pressable
                key={m.key}
                testID={`2fa-method-${m.key}`}
                style={[
                  s.methodCard,
                  {
                    borderColor: selectedMethod === m.key ? c.primary : c.border,
                    backgroundColor: selectedMethod === m.key ? `${c.primary}0D` : c.surface,
                  },
                ]}
                onPress={() => setSelectedMethod(m.key)}
              >
                <View style={s.methodCardHeader}>
                  <View
                    style={[
                      s.methodIcon,
                      {
                        backgroundColor:
                          selectedMethod === m.key ? `${c.primary}1A` : `${c.textSecondary}1A`,
                      },
                    ]}
                  >
                    <IconSymbol
                      name={m.icon}
                      size={20}
                      color={selectedMethod === m.key ? c.primary : c.textSecondary}
                    />
                  </View>
                  <View style={s.methodCardText}>
                    <Text style={[s.methodTitle, { color: c.text }]}>{m.title}</Text>
                    <Text style={[s.methodDescription, { color: c.textSecondary }]}>
                      {m.description}
                    </Text>
                  </View>
                  <View
                    style={[
                      s.radio,
                      { borderColor: selectedMethod === m.key ? c.primary : c.border },
                    ]}
                  >
                    {selectedMethod === m.key ? (
                      <View style={[s.radioInner, { backgroundColor: c.primary }]} />
                    ) : null}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
          <Text style={[s.methodNote, { color: c.textSecondary }]}>
            You can always use either method or a backup code when signing in, regardless of which
            you set up now.
          </Text>
        </View>
      ),
    },
    {
      ...totpStep,
      skip: selectedMethod !== "totp",
    },
    {
      id: "backup",
      title: "Save Backup Codes",
      subtitle: "Keep these codes safe — they're your fallback if you lose your device",
      content: (
        <ScrollView keyboardShouldPersistTaps="handled" style={s.stepContent}>
          <BackupCodesDisplay codes={backupCodes} testID="2fa-backup-codes" />
        </ScrollView>
      ),
      validate: () => {
        if (!codesAcknowledged) return "Please confirm you've saved your backup codes";
        return true;
      },
    },
    {
      id: "success",
      title: "You're All Set!",
      subtitle: "Two-factor authentication is now enabled on your account",
      content: (
        <View style={[s.stepContent, s.successContent]}>
          <View style={[s.successIcon, { backgroundColor: `${c.success}1A` }]}>
            <IconSymbol name="checkmark.shield.fill" size={48} color={c.success} />
          </View>
          <Text style={[s.successText, { color: c.textSecondary }]}>
            You'll be asked for a verification code each time you sign in. You can use your
            authenticator app, email, or a backup code.
          </Text>
        </View>
      ),
    },
  ];

  const steps = isReconfigure ? reconfigureSteps : freshSetupSteps;

  return (
    <KeyboardView>
      <View style={[s.container, { backgroundColor: c.bg }]}>
        <StepWizard
          steps={steps}
          helpersRef={helpersRef}
          onComplete={() => router.back()}
          renderFooter={(helpers) => {
            const activeSteps = steps.filter((st) => !("skip" in st && st.skip));
            const currentStepId = activeSteps[helpers.currentIndex]?.id;

            if (currentStepId === "totp") return null;

            return (
              <View style={s.footer}>
                {currentStepId === "backup" ? (
                  <Pressable
                    style={s.checkboxRow}
                    onPress={() => setCodesAcknowledged((prev) => !prev)}
                  >
                    <View
                      style={[
                        s.checkbox,
                        {
                          borderColor: codesAcknowledged ? c.primary : c.border,
                          backgroundColor: codesAcknowledged ? c.primary : "transparent",
                        },
                      ]}
                    >
                      {codesAcknowledged ? (
                        <IconSymbol name="checkmark" size={12} color="#FFFFFF" />
                      ) : null}
                    </View>
                    <Text style={[s.checkboxLabel, { color: c.text }]}>
                      I have saved my backup codes
                    </Text>
                  </Pressable>
                ) : null}

                <View style={s.footerButtons}>
                  {helpers.canGoBack && currentStepId !== "success" ? (
                    <Button variant="outline" onPress={helpers.goBack} style={s.backBtn}>
                      Back
                    </Button>
                  ) : null}
                  <Button
                    onPress={helpers.goNext}
                    isLoading={helpers.isValidating}
                    style={s.nextBtn}
                  >
                    {helpers.isLastStep ? "Done" : "Next"}
                  </Button>
                </View>
              </View>
            );
          }}
        />
      </View>
    </KeyboardView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    paddingBottom: 48,
  },
  stepContent: {
    flex: 1,
  },
  methodOptions: {
    gap: spacing.md,
  },
  methodCard: {
    borderWidth: 1.5,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  methodCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  methodCardText: {
    flex: 1,
    gap: 2,
  },
  methodTitle: {
    fontSize: 16,
    fontFamily: fonts.semibold,
  },
  methodDescription: {
    fontSize: 13,
    fontFamily: fonts.regular,
    lineHeight: 18,
  },
  methodNote: {
    fontSize: 13,
    fontFamily: fonts.regular,
    lineHeight: 18,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  totpContent: {
    alignItems: "center",
    gap: spacing.xl,
    paddingBottom: spacing.xl,
  },
  qrContainer: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    alignItems: "center",
  },
  secretSection: {
    width: "100%",
    gap: spacing.xs,
  },
  secretLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  secretRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  secretText: {
    fontSize: 14,
    fontFamily: "monospace",
    letterSpacing: 1,
    flexShrink: 1,
  },
  verifySection: {
    width: "100%",
    gap: spacing.md,
  },
  verifyLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    textAlign: "center",
  },
  successContent: {
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xl,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  successText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  footer: {
    gap: spacing.lg,
  },
  footerButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  backBtn: {
    flex: 1,
  },
  nextBtn: {
    flex: 2,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
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
  checkboxLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  passwordInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  errorText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    marginTop: spacing.xs,
  },
});
