import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BackupCodesDisplay } from "@/components/auth/backup-codes-display";
import { prompt } from "@/components/ui/confirm-dialog";
import { SettingsListItem, SettingsListSection } from "@/components/ui/settings-list";
import { authClient } from "@/lib/auth";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { fonts, spacing, useTheme } from "@/styles";

export default function TwoFactorManageScreen() {
  const { colors: c } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const handleReconfigureAuthenticator = () => {
    router.push("/(app)/settings/account/two-factor-setup?mode=reconfigure");
  };

  const handleRegenerateBackupCodes = async () => {
    const password = await prompt({
      title: "Regenerate Backup Codes",
      message: "This will replace your current backup codes. Enter your password to continue.",
      placeholder: "Password",
      confirmLabel: "Regenerate",
      secureTextEntry: true,
    });
    if (!password) return;

    setRegenerating(true);
    try {
      const result = await authClient.twoFactor.generateBackupCodes({ password });
      if (result.error) {
        toast.error(result.error.message ?? "Failed to generate backup codes");
        return;
      }
      setBackupCodes(result.data?.backupCodes ?? []);
    } catch {
      toast.error("Failed to generate backup codes");
    } finally {
      setRegenerating(false);
    }
  };

  const handleDisable = async () => {
    const password = await prompt({
      title: "Disable Two-Factor Authentication",
      message:
        "This will remove the extra layer of security from your account. Enter your password to confirm.",
      placeholder: "Password",
      confirmLabel: "Disable 2FA",
      secureTextEntry: true,
    });
    if (!password) return;

    setDisabling(true);
    try {
      const result = await authClient.twoFactor.disable({ password });
      if (result.error) {
        toast.error(result.error.message ?? "Failed to disable 2FA");
        return;
      }
      toast.success("Two-factor authentication has been disabled");
      router.back();
    } catch {
      toast.error("Failed to disable 2FA");
    } finally {
      setDisabling(false);
    }
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={[s.container, { backgroundColor: c.bg }]}
      contentContainerStyle={s.scrollContent}
    >
      <View style={[s.statusBanner, { backgroundColor: `${c.success}1A` }]}>
        <Text style={[s.statusText, { color: c.success }]}>
          Two-factor authentication is enabled
        </Text>
      </View>

      <SettingsListSection title="Methods">
        <SettingsListItem
          icon="lock.app.dashed"
          label="Authenticator App"
          subtitle="Reconfigure or set up a new authenticator"
          onPress={handleReconfigureAuthenticator}
        />
        <SettingsListItem
          icon="envelope.fill"
          label="Email OTP"
          subtitle="One-time codes sent to your email"
          showChevron={false}
          right={
            <View style={[s.methodBadge, { backgroundColor: `${c.primary}1A` }]}>
              <Text style={[s.methodBadgeText, { color: c.primary }]}>Available</Text>
            </View>
          }
        />
        <SettingsListItem
          icon="phone.fill"
          label="Phone OTP"
          subtitle={
            user?.phoneNumberVerified
              ? "One-time codes sent via SMS"
              : "Verify your phone number in profile settings to enable"
          }
          showChevron={!user?.phoneNumberVerified}
          onPress={
            user?.phoneNumberVerified
              ? undefined
              : () => router.push("/(app)/settings/account/profile")
          }
          right={
            <View
              style={[
                s.methodBadge,
                {
                  backgroundColor: user?.phoneNumberVerified
                    ? `${c.primary}1A`
                    : `${c.textSecondary}1A`,
                },
              ]}
            >
              <Text
                style={[
                  s.methodBadgeText,
                  { color: user?.phoneNumberVerified ? c.primary : c.textSecondary },
                ]}
              >
                {user?.phoneNumberVerified ? "Available" : "Not Set Up"}
              </Text>
            </View>
          }
          isLast
        />
      </SettingsListSection>

      <SettingsListSection title="Recovery">
        <SettingsListItem
          icon="key.fill"
          label="Backup Codes"
          subtitle="Regenerate recovery codes (replaces current set)"
          loading={regenerating}
          onPress={handleRegenerateBackupCodes}
        />
        <SettingsListItem
          icon="xmark.shield.fill"
          label="Disable Two-Factor"
          subtitle="Remove 2FA from your account"
          destructive
          loading={disabling}
          showChevron={false}
          onPress={handleDisable}
          isLast
        />
      </SettingsListSection>

      {backupCodes ? (
        <View style={s.codesSection}>
          <Text style={[s.codesSectionTitle, { color: c.text }]}>New Backup Codes</Text>
          <Text style={[s.codesNote, { color: c.textSecondary }]}>
            Your previous codes have been invalidated. Save these now — you won't be able to view
            them again.
          </Text>
          <BackupCodesDisplay codes={backupCodes} testID="2fa-manage-backup-codes" />
        </View>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 48,
  },
  statusBanner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
  },
  methodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  methodBadgeText: {
    fontSize: 12,
    fontFamily: fonts.semibold,
  },
  codesSection: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  codesSectionTitle: {
    fontSize: 16,
    fontFamily: fonts.semibold,
  },
  codesNote: {
    fontSize: 13,
    fontFamily: fonts.regular,
    lineHeight: 18,
  },
});
