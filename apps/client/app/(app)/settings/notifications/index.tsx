import type { NotificationCategory, UserNotificationPreferences } from "@repo/shared";
import { DEFAULT_NOTIFICATION_PREFERENCES, NOTIFICATION_CATEGORIES } from "@repo/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Linking, Platform, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { confirm } from "@/components/ui/confirm-dialog";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SettingsListSection } from "@/components/ui/settings-list";
import { useNotificationPermission } from "@/hooks/use-notification-permission";
import { authClient } from "@/lib/auth";
import { useAuth } from "@/providers/auth-provider";
import { usePush } from "@/providers/push-provider";
import { useToast } from "@/providers/toast-provider";
import { fonts, spacing, useTheme } from "@/styles";

const CATEGORY_CONFIG: Record<
  NotificationCategory,
  { label: string; icon: string; description: string }
> = {
  marketing: {
    label: "Marketing",
    icon: "megaphone.fill",
    description: "Promotions, tips, and product updates",
  },
  general: {
    label: "General",
    icon: "bell.fill",
    description: "System alerts and other notifications",
  },
};

export default function NotificationSettingsScreen() {
  const { colors: c } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const pushPermission = useNotificationPermission();
  const { registerToken } = usePush();
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});

  const prefs: UserNotificationPreferences = useMemo(
    () => ({
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...(user?.metadata?.notificationPreferences ?? {}),
      categories: {
        ...DEFAULT_NOTIFICATION_PREFERENCES.categories,
        ...((
          user?.metadata?.notificationPreferences as
            | Partial<UserNotificationPreferences>
            | undefined
        )?.categories ?? {}),
      },
    }),
    [user?.metadata?.notificationPreferences],
  );

  useEffect(() => {
    setOptimistic((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const key of Object.keys(next)) {
        let real: boolean;
        if (key === "push" || key === "email" || key === "sms") {
          real = prefs[key];
        } else if (key.startsWith("cat-")) {
          const cat = key.slice(4) as NotificationCategory;
          real = prefs.categories[cat] !== false;
        } else {
          continue;
        }
        if (real === next[key]) {
          delete next[key];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [prefs]);

  const getChannelValue = useCallback(
    (key: "push" | "email" | "sms") => (key in optimistic ? optimistic[key] : prefs[key]),
    [optimistic, prefs],
  );

  const getCategoryValue = useCallback(
    (cat: NotificationCategory) => {
      const oKey = `cat-${cat}`;
      return oKey in optimistic ? optimistic[oKey] : prefs.categories[cat] !== false;
    },
    [optimistic, prefs.categories],
  );

  const updatePrefs = useCallback(
    async (patch: Partial<UserNotificationPreferences>): Promise<boolean> => {
      const updated: UserNotificationPreferences = {
        ...prefs,
        ...patch,
        categories: {
          ...prefs.categories,
          ...(patch.categories ?? {}),
        },
      };
      const { error } = await authClient.updateUser({
        metadata: { ...user?.metadata, notificationPreferences: updated },
      } as Record<string, unknown>);
      if (error) {
        toast.error(error.message ?? "Failed to save preference.");
        return false;
      }
      return true;
    },
    [prefs, toast, user?.metadata],
  );

  const toggleChannel = useCallback(
    async (key: "push" | "email" | "sms", value: boolean) => {
      if (key === "push" && value) {
        if (pushPermission.isGranted) {
          setOptimistic((o) => ({ ...o, push: true }));
          const ok = await updatePrefs({ push: true });
          if (ok) registerToken();
        } else if (pushPermission.canAskAgain) {
          const status = await pushPermission.request();
          if (status === "granted") {
            setOptimistic((o) => ({ ...o, push: true }));
            const ok = await updatePrefs({ push: true });
            if (ok) registerToken();
          } else {
            toast.warning("Push notification permission was denied.");
          }
        } else {
          if (Platform.OS === "web") {
            toast.warning("Please enable notifications in your browser settings.");
          } else {
            const confirmed = await confirm({
              title: "Push Notifications",
              message:
                "Push notifications are disabled in your device settings. Open Settings to enable them?",
              confirmLabel: "Open Settings",
            });
            if (confirmed) Linking.openSettings();
          }
        }
      } else {
        setOptimistic((o) => ({ ...o, [key]: value }));
        await updatePrefs({ [key]: value });
      }
    },
    [pushPermission, updatePrefs, registerToken, toast],
  );

  const toggleCategory = useCallback(
    async (cat: NotificationCategory, value: boolean) => {
      const oKey = `cat-${cat}`;
      setOptimistic((o) => ({ ...o, [oKey]: value }));
      await updatePrefs({
        categories: { ...prefs.categories, [cat]: value },
      });
    },
    [prefs.categories, updatePrefs],
  );

  const allCategoriesOn = NOTIFICATION_CATEGORIES.every((cat) => getCategoryValue(cat));

  const toggleAllCategories = useCallback(
    async (value: boolean) => {
      const keys = NOTIFICATION_CATEGORIES.map((cat) => `cat-${cat}`);
      const overrides = Object.fromEntries(keys.map((k) => [k, value]));
      setOptimistic((o) => ({ ...o, ...overrides }));
      const categories = Object.fromEntries(
        NOTIFICATION_CATEGORIES.map((cat) => [cat, value]),
      ) as Record<NotificationCategory, boolean>;
      await updatePrefs({ categories });
    },
    [updatePrefs],
  );

  const userPhone = (user?.metadata?.profileContact as { displayPhone?: string } | undefined)
    ?.displayPhone;

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={[s.container, { backgroundColor: c.bg }]}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Channels */}
      <SettingsListSection title="Channels">
        <ChannelRow
          icon="iphone"
          label="Push Notifications"
          hint={
            pushPermission.isGranted
              ? "Receive alerts on your device"
              : pushPermission.canAskAgain
                ? "Tap to enable device permission"
                : "Disabled in device settings"
          }
          value={getChannelValue("push") && pushPermission.isGranted}
          onToggle={(v) => void toggleChannel("push", v)}
        />
        <ChannelRow
          icon="envelope.fill"
          label="Email Notifications"
          hint={`Send to ${user?.email ?? "your email"}`}
          value={getChannelValue("email")}
          onToggle={(v) => void toggleChannel("email", v)}
          border
        />
        <ChannelRow
          icon="message.fill"
          label="Text Messages (SMS)"
          hint={userPhone ? `Send to ${userPhone}` : "Add a phone number in your profile first"}
          value={getChannelValue("sms")}
          onToggle={(v) => void toggleChannel("sms", v)}
          disabled={!userPhone}
          border
        />
      </SettingsListSection>

      {/* Categories */}
      <SettingsListSection
        title="Categories"
        right={
          <Switch
            value={allCategoriesOn}
            onValueChange={toggleAllCategories}
            trackColor={{ false: c.border, true: c.primary }}
          />
        }
      >
        <View style={s.categoryHint}>
          <Text style={[s.categoryHintText, { color: c.textSecondary }]}>
            Choose which types of notifications you receive.
          </Text>
        </View>
        {NOTIFICATION_CATEGORIES.map((cat, idx) => {
          const cfg = CATEGORY_CONFIG[cat];
          return (
            <View
              key={cat}
              style={[
                s.catRow,
                idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border },
              ]}
            >
              <IconSymbol name={cfg.icon} size={20} color={c.textSecondary} />
              <View style={s.catContent}>
                <Text style={[s.catLabel, { color: c.text }]}>{cfg.label}</Text>
                <Text style={[s.catHint, { color: c.textSecondary }]}>{cfg.description}</Text>
              </View>
              <Switch
                value={getCategoryValue(cat)}
                onValueChange={(v) => void toggleCategory(cat, v)}
                trackColor={{ false: c.border, true: c.primary }}
              />
            </View>
          );
        })}
      </SettingsListSection>
    </ScrollView>
  );
}

function ChannelRow({
  icon,
  label,
  hint,
  value,
  onToggle,
  disabled,
  border,
}: {
  icon: string;
  label: string;
  hint: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  disabled?: boolean;
  border?: boolean;
}) {
  const { colors: c } = useTheme();

  return (
    <View
      style={[
        s.channelRow,
        border && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border },
      ]}
    >
      <IconSymbol name={icon} size={20} color={disabled ? c.border : c.textSecondary} />
      <View style={s.channelContent}>
        <Text style={[s.channelLabel, { color: disabled ? c.textSecondary : c.text }]}>
          {label}
        </Text>
        <Text style={[s.channelHint, { color: c.textSecondary }]}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: c.border, true: c.primary }}
        disabled={disabled}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  channelContent: {
    flex: 1,
  },
  channelLabel: {
    fontSize: 15,
    fontFamily: fonts.regular,
  },
  channelHint: {
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  categoryHint: {
    paddingHorizontal: spacing.lg,
    paddingTop: 12,
    paddingBottom: 4,
  },
  categoryHintText: {
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  catContent: {
    flex: 1,
  },
  catLabel: {
    fontSize: 15,
    fontFamily: fonts.regular,
  },
  catHint: {
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
});
