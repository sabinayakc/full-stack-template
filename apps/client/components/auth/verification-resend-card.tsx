import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { fonts, radius, useTheme } from "@/styles";

type VerificationResendCardProps = {
  message: string;
  cooldownRemaining: number;
  resendLoading: boolean;
  onResend: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
};

export function VerificationResendCard({
  message,
  cooldownRemaining,
  resendLoading,
  onResend,
  secondaryActionLabel,
  onSecondaryAction,
}: VerificationResendCardProps) {
  const { colors: c } = useTheme();

  return (
    <View
      style={[
        s.card,
        {
          borderColor: "rgba(14, 165, 233, 0.15)",
          backgroundColor: "rgba(14, 165, 233, 0.07)",
        },
      ]}
    >
      <Text style={[s.messageText, { color: c.text }]}>{message}</Text>
      <View style={s.innerGap}>
        <Text style={[s.caption, { color: c.textSecondary }]}>
          {cooldownRemaining > 0
            ? `You can resend another verification email in ${cooldownRemaining}s.`
            : "Need another link? You can resend it now."}
        </Text>
        <View style={s.actionsRow}>
          {secondaryActionLabel && onSecondaryAction ? (
            <Pressable onPress={onSecondaryAction} style={s.secondaryBtn}>
              <Text style={[s.secondaryBtnText, { color: c.primary }]}>{secondaryActionLabel}</Text>
            </Pressable>
          ) : (
            <View style={s.flex1} />
          )}

          <Button
            variant="inverted"
            size="md"
            isLoading={resendLoading}
            loadingText="Sending..."
            onPress={onResend}
            disabled={cooldownRemaining > 0 || resendLoading}
            style={{ height: 40, paddingHorizontal: 12 }}
          >
            Resend Email
          </Button>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    gap: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  messageText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  innerGap: {
    gap: 12,
  },
  caption: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  secondaryBtn: {
    height: 40,
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  flex1: {
    flex: 1,
  },
});
