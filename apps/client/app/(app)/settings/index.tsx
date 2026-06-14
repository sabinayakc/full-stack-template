import type { DeletePreflightResult } from "@repo/shared";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { confirm, confirmWithInput } from "@/components/ui/confirm-dialog";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SettingsListItem, SettingsListSection } from "@/components/ui/settings-list";
import { APP_VERSION_DISPLAY } from "@/constants/app";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import { usePermission } from "@/hooks/use-permission";
import { fetchWithAuth } from "@/lib/api";
import { authClient } from "@/lib/auth";
import { showPreflightBlockers } from "@/lib/preflight";
import { useAppearance } from "@/providers/appearance-provider";
import { useAuth } from "@/providers/auth-provider";
import { useQueryReset } from "@/providers/query-provider";
import { useToast } from "@/providers/toast-provider";
import { fonts, radius, spacing, useTheme } from "@/styles";

type AppearanceMode = "system" | "light" | "dark";

const APPEARANCE_OPTIONS: { value: AppearanceMode; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "sun.max.fill" },
  { value: "dark", label: "Dark", icon: "moon.fill" },
  { value: "system", label: "System", icon: "circle.lefthalf.filled" },
];

function AppearancePicker() {
  const { colors: c } = useTheme();
  const { mode, setMode } = useAppearance();

  return (
    <View style={s.appearanceRow}>
      {APPEARANCE_OPTIONS.map((option) => {
        const isActive = mode === option.value;
        return (
          <Pressable
            key={option.value}
            style={[
              s.appearanceOption,
              {
                backgroundColor: isActive ? c.primarySubtle : "transparent",
                borderColor: isActive ? c.primary : "transparent",
              },
            ]}
            onPress={() => setMode(option.value)}
          >
            <IconSymbol
              name={option.icon}
              size={18}
              color={isActive ? c.primary : c.textSecondary}
            />
            <Text style={[s.appearanceLabel, { color: isActive ? c.primary : c.textSecondary }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsScreen() {
  const { colors: c } = useTheme();
  const { user, activeOrganization } = useAuth();
  const { can } = usePermission();
  const canManageSettings = can("settings", "update");
  const canManageBilling = can("billing", "manage");
  const router = useRouter();
  const toast = useToast();
  const resetQueries = useQueryReset();
  const insets = useSafeAreaInsets();
  const { avatarUrl } = useAvatarUrl();
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  const handleSignOut = async () => {
    const confirmed = await confirm({
      title: "Sign Out",
      message: "Are you sure you want to sign out?",
      confirmLabel: "Sign Out",
      variant: "danger",
    });
    if (confirmed) {
      resetQueries();
      await authClient.signOut();
    }
  };

  const handleDeleteAccount = async () => {
    // Run preflight check
    try {
      const preflight: DeletePreflightResult = await fetchWithAuth(
        "/organizations/user/delete-preflight",
      );
      if (!preflight.canDelete) {
        await showPreflightBlockers("Cannot Delete Account", preflight);
        return;
      }
    } catch {
      toast.error("Failed to check account status.");
      return;
    }

    const confirmed = await confirmWithInput({
      title: "Delete Account",
      message: "This action is permanent and cannot be undone. All your data will be deleted.",
      confirmLabel: "Delete",
      variant: "danger",
      requiredText: "delete my account",
    });
    if (confirmed) {
      await authClient.deleteUser();
    }
  };

  return (
    <View style={[s.container, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      {/* Header with close button */}
      <View style={s.header}>
        <View style={s.headerSpacer} />
        <Text style={[s.headerTitle, { color: c.text }]}>Settings</Text>
        <Pressable
          style={[s.closeButton, { backgroundColor: c.surface }]}
          onPress={() => router.navigate("/(app)")}
        >
          <IconSymbol name="xmark" size={16} color={c.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[s.scrollContent, { paddingBottom: 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User info header */}
        <View style={s.userHeader}>
          <View style={[s.avatar, { backgroundColor: c.primaryMuted }]}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={[s.avatarImage, !avatarLoaded && s.hidden]}
                onLoad={() => setAvatarLoaded(true)}
                onError={() => setAvatarLoaded(false)}
              />
            ) : null}
            {!avatarLoaded ? (
              <Text style={[s.avatarText, { color: c.text }]}>
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </Text>
            ) : null}
          </View>
          <Text style={[s.userName, { color: c.text }]}>{user?.name}</Text>
          <Text style={[s.userEmail, { color: c.textSecondary }]}>{user?.email}</Text>
        </View>

        {/* Account section */}
        <SettingsListSection title="Account">
          <SettingsListItem
            icon="building.fill"
            label="Manage Organization"
            subtitle={activeOrganization?.name ?? "No organization"}
            onPress={() => router.push("/(app)/settings/organization" as never)}
          />
          <SettingsListItem
            icon="person.circle.fill"
            label="Profile"
            subtitle="Name, photo, and personal info"
            onPress={() => router.push("/(app)/settings/account/profile" as never)}
          />
          <SettingsListItem
            icon="lock.fill"
            label="Security"
            subtitle="Password and authentication"
            onPress={() => router.push("/(app)/settings/account/security" as never)}
          />
          {canManageBilling && (
            <SettingsListItem
              icon="crown.fill"
              label="Subscription"
              subtitle="Plan, billing, and seats"
              onPress={() => router.push("/(app)/settings/subscription" as never)}
            />
          )}
          {canManageSettings && (
            <SettingsListItem
              icon="creditcard.fill"
              label="Payments"
              subtitle="Accept payments from customers"
              onPress={() => router.push("/(app)/settings/payment" as never)}
            />
          )}
          {canManageSettings && (
            <SettingsListItem
              icon="puzzlepiece.extension.fill"
              label="Integrations"
              subtitle="Connected apps and services"
              onPress={() => router.push("/(app)/settings/integrations")}
            />
          )}
          {canManageSettings && (
            <SettingsListItem
              icon="gearshape.2.fill"
              label="Admin"
              subtitle="Templates, catalog, and defaults"
              onPress={() => router.push("/(app)/settings/admin" as never)}
            />
          )}
        </SettingsListSection>

        {/* Appearance section */}
        <SettingsListSection title="Appearance">
          <View style={s.appearanceContainer}>
            <AppearancePicker />
          </View>
        </SettingsListSection>

        {/* Notifications */}
        <SettingsListSection title="Notifications">
          <SettingsListItem
            icon="bell.badge.fill"
            label="Notification Preferences"
            subtitle="Channels, categories, and alerts"
            onPress={() => router.push("/(app)/settings/notifications")}
            isLast
          />
        </SettingsListSection>

        {/* About section */}
        <SettingsListSection title="About">
          <SettingsListItem
            icon="questionmark.circle.fill"
            label="Help Center"
            subtitle="FAQs and guides"
            onPress={() => router.push("/(app)/settings/support/help-center" as never)}
          />
          <SettingsListItem
            icon="envelope.fill"
            label="Support"
            subtitle="Contact us for help"
            onPress={() => router.push("/(app)/settings/support/contact" as never)}
          />
          <SettingsListItem
            icon="hand.raised.fill"
            label="Privacy Policy"
            subtitle="How we handle your data"
            onPress={() => router.push("/(app)/settings/support/privacy" as never)}
          />
          <SettingsListItem
            icon="doc.text.fill"
            label="Terms of Service"
            subtitle="Usage terms and conditions"
            onPress={() => router.push("/(app)/settings/support/terms" as never)}
          />
          <SettingsListItem
            icon="info.circle.fill"
            label="Version"
            showChevron={false}
            right={
              <Text style={[s.versionText, { color: c.textSecondary }]}>{APP_VERSION_DISPLAY}</Text>
            }
            isLast
          />
        </SettingsListSection>

        {/* Danger zone */}
        <SettingsListSection>
          <SettingsListItem
            icon="arrow.right.square"
            label="Sign Out"
            destructive
            showChevron={false}
            onPress={handleSignOut}
          />
          <SettingsListItem
            icon="trash.fill"
            label="Delete Account"
            destructive
            showChevron={false}
            onPress={handleDeleteAccount}
            isLast
          />
        </SettingsListSection>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fonts.semibold,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  userHeader: {
    alignItems: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  avatarImage: {
    ...StyleSheet.absoluteFillObject,
    width: 64,
    height: 64,
    borderRadius: radius.full,
  },
  hidden: {
    opacity: 0,
  },
  avatarText: {
    fontSize: 24,
    fontFamily: fonts.bold,
  },
  userName: {
    fontSize: 20,
    fontFamily: fonts.semibold,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  appearanceContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  appearanceRow: {
    flexDirection: "row",
    gap: 6,
  },
  appearanceOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  appearanceLabel: {
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  versionText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
});
