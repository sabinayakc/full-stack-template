import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { confirm } from "@/components/ui/confirm-dialog";
import { SettingsListItem, SettingsListSection } from "@/components/ui/settings-list";
import { authClient } from "@/lib/auth";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { fonts, spacing, useTheme } from "@/styles";

export default function SecurityScreen() {
  const { colors: c } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [sending, setSending] = useState(false);

  const handleChangePassword = async () => {
    if (!user?.email) return;

    const confirmed = await confirm({
      title: "Reset Password",
      message: "A password reset link will be sent to your email. Continue?",
      confirmLabel: "Send Link",
    });
    if (!confirmed) return;

    setSending(true);
    try {
      const { error } = await authClient.requestPasswordReset({ email: user.email });
      if (error) {
        toast.error(error.message ?? "Failed to send reset email.");
      } else {
        toast.success("A password reset link has been sent to your email.");
      }
    } finally {
      setSending(false);
    }
  };

  const handleTwoFactorPress = () => {
    if (user?.twoFactorEnabled) {
      router.push("/(app)/settings/account/two-factor-manage");
    } else {
      router.push("/(app)/settings/account/two-factor-setup");
    }
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={[s.container, { backgroundColor: c.bg }]}
      contentContainerStyle={s.scrollContent}
    >
      <SettingsListSection title="Password">
        <SettingsListItem
          icon="lock.fill"
          label="Change Password"
          subtitle="Send a password reset link to your email"
          showChevron={false}
          onPress={handleChangePassword}
          right={sending ? <ActivityIndicator size="small" /> : undefined}
          isLast
        />
      </SettingsListSection>

      <SettingsListSection title="Two-Factor Authentication">
        <SettingsListItem
          icon="shield.lefthalf.filled"
          label="Two-Factor Authentication"
          subtitle={
            user?.twoFactorEnabled
              ? `Enabled — Authenticator, Email${user.phoneNumberVerified ? ", Phone" : ""}`
              : "Add an extra layer of security"
          }
          onPress={handleTwoFactorPress}
          right={
            user?.twoFactorEnabled ? (
              <View style={[s.badge, { backgroundColor: `${c.success}1A` }]}>
                <Text style={[s.badgeText, { color: c.success }]}>On</Text>
              </View>
            ) : undefined
          }
          isLast
        />
      </SettingsListSection>

      <SettingsListSection title="Sessions">
        <SettingsListItem
          icon="iphone.gen3"
          label="Active Sessions"
          subtitle="Manage your signed-in devices"
          onPress={() => router.push("/(app)/settings/account/sessions" as never)}
          isLast
        />
      </SettingsListSection>

      <View style={s.infoBox}>
        <Text style={[s.infoText, { color: c.textSecondary }]}>
          For your security, password changes are handled via email. You'll receive a link to set a
          new password.
        </Text>
      </View>
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
  infoBox: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  infoText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
  },
});
