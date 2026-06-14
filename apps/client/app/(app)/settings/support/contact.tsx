import * as Clipboard from "expo-clipboard";
import * as MailComposer from "expo-mail-composer";
import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { APP_NAME, APP_VERSION_DISPLAY, SUPPORT_EMAIL } from "@/constants/app";
import { useToast } from "@/providers/toast-provider";
import { fonts, radius, spacing, useTheme } from "@/styles";

async function openMailCompose(subject: string, body: string, onClipboardFallback: () => void) {
  if (Platform.OS === "web") {
    const params = new URLSearchParams({
      subject,
      body,
    });
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?${params.toString()}`);
    return;
  }

  const available = await MailComposer.isAvailableAsync();
  if (available) {
    await MailComposer.composeAsync({
      recipients: [SUPPORT_EMAIL],
      subject,
      body,
    });
    return;
  }

  const supported = await Linking.canOpenURL(`mailto:${SUPPORT_EMAIL}`);
  if (supported) {
    const params = new URLSearchParams({ subject, body });
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?${params.toString()}`);
    return;
  }

  // No mail client available — copy the support address to the clipboard so the
  // user can paste it into whichever app they prefer.
  await Clipboard.setStringAsync(SUPPORT_EMAIL);
  onClipboardFallback();
}

type SupportOptionProps = {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  isLast?: boolean;
};

function SupportOption({
  icon,
  title,
  subtitle,
  onPress,
  loading,
  disabled,
  isLast,
}: SupportOptionProps) {
  const { colors: c } = useTheme();

  return (
    <Pressable
      style={[
        s.option,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
        disabled && { opacity: 0.5 },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <View style={[s.iconCircle, { backgroundColor: c.primarySubtle }]}>
        {loading ? (
          <ActivityIndicator size="small" color={c.primary} />
        ) : (
          <IconSymbol name={icon} size={20} color={c.primary} />
        )}
      </View>
      <View style={s.optionContent}>
        <Text style={[s.optionTitle, { color: c.text }]}>{title}</Text>
        <Text style={[s.optionSubtitle, { color: c.textSecondary }]}>{subtitle}</Text>
      </View>
      <IconSymbol name="chevron.right" size={14} color={c.textSecondary} />
    </Pressable>
  );
}

export default function SupportScreen() {
  const { colors: c } = useTheme();
  const toast = useToast();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const handleClipboardFallback = () => {
    toast.info(`No mail app found. Copied ${SUPPORT_EMAIL} to clipboard.`);
  };

  const handleAction = async (key: string, subject: string, body: string) => {
    setLoadingKey(key);
    try {
      await openMailCompose(subject, body, handleClipboardFallback);
    } finally {
      setLoadingKey(null);
    }
  };

  const handleEmailSupport = () =>
    handleAction(
      "support",
      `${APP_NAME} Support Request`,
      `\n\n---\nApp: ${APP_NAME}\nVersion: ${APP_VERSION_DISPLAY}`,
    );

  const handleBugReport = () =>
    handleAction(
      "bug",
      `${APP_NAME} Bug Report`,
      `Please describe the issue:\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected behavior:\n\nActual behavior:\n\n---\nApp: ${APP_NAME}\nVersion: ${APP_VERSION_DISPLAY}`,
    );

  const handleFeatureRequest = () =>
    handleAction(
      "feature",
      `${APP_NAME} Feature Request`,
      `Feature description:\n\nUse case:\n\n---\nApp: ${APP_NAME}\nVersion: ${APP_VERSION_DISPLAY}`,
    );

  return (
    <View style={[s.container, { backgroundColor: c.bg }]}>
      <View style={s.content}>
        <View style={s.heroSection}>
          <View style={[s.heroIcon, { backgroundColor: c.primarySubtle }]}>
            <IconSymbol name="headphones" size={32} color={c.primary} />
          </View>
          <Text style={[s.heroTitle, { color: c.text }]}>How can we help?</Text>
          <Text style={[s.heroSubtitle, { color: c.textSecondary }]}>
            Choose an option below or email us directly at{" "}
            <Text
              style={{ color: c.primary, fontFamily: fonts.medium }}
              onPress={() => openMailCompose(`${APP_NAME} Support`, "", handleClipboardFallback)}
            >
              {SUPPORT_EMAIL}
            </Text>
          </Text>
        </View>

        <View style={[s.optionsCard, { backgroundColor: c.bgSecondary, borderColor: c.border }]}>
          <SupportOption
            icon="envelope.fill"
            title="Email Support"
            subtitle="Get help from our team"
            onPress={handleEmailSupport}
            loading={loadingKey === "support"}
            disabled={loadingKey !== null}
          />
          <SupportOption
            icon="ladybug.fill"
            title="Report a Bug"
            subtitle="Something not working right?"
            onPress={handleBugReport}
            loading={loadingKey === "bug"}
            disabled={loadingKey !== null}
          />
          <SupportOption
            icon="lightbulb.fill"
            title="Feature Request"
            subtitle="Suggest an improvement"
            onPress={handleFeatureRequest}
            loading={loadingKey === "feature"}
            disabled={loadingKey !== null}
            isLast
          />
        </View>

        <Text style={[s.versionText, { color: c.textSecondary }]}>
          {APP_NAME} v{APP_VERSION_DISPLAY}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing["2xl"],
  },
  heroSection: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: fonts.bold,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  optionsCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontFamily: fonts.medium,
  },
  optionSubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  versionText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
