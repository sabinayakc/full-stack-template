import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts, radius, useTheme } from "@/styles";

interface WizardStickyFooterProps {
  canGoBack: boolean;
  isLastStep: boolean;
  isLoading?: boolean;
  loadingText?: string;
  continueLabel?: string;
  lastStepLabel?: string;
  exitLabel?: string;
  onContinue: () => void;
  onBack: () => void;
  onExit: () => void;
  /** Optional status line (e.g. "Saved 2:35 PM") shown above the buttons. */
  statusText?: string;
}

export function WizardStickyFooter({
  canGoBack,
  isLastStep,
  isLoading,
  loadingText,
  continueLabel = "Continue",
  lastStepLabel,
  exitLabel = "Exit",
  onContinue,
  onBack,
  onExit,
  statusText,
}: WizardStickyFooterProps) {
  const { colors: c } = useTheme();
  const primaryLabel = isLastStep ? (lastStepLabel ?? continueLabel) : continueLabel;

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[
        s.container,
        { backgroundColor: c.bg, borderTopColor: c.border },
        Platform.OS === "web" && s.containerWeb,
      ]}
    >
      {statusText ? (
        <Text style={[s.statusText, { color: c.textSecondary }]}>{statusText}</Text>
      ) : null}
      <View style={s.row}>
        <Pressable
          style={[s.textBtn, { minWidth: 56 }]}
          onPress={canGoBack ? onBack : onExit}
          disabled={isLoading}
          testID={canGoBack ? "wizard-back" : "wizard-exit"}
        >
          <Text
            style={[
              s.textBtnLabel,
              { color: canGoBack ? c.textSecondary : c.danger, opacity: isLoading ? 0.4 : 1 },
            ]}
          >
            {canGoBack ? "Back" : exitLabel}
          </Text>
        </Pressable>

        <Pressable
          style={[s.primaryBtn, { backgroundColor: c.primary, opacity: isLoading ? 0.6 : 1 }]}
          onPress={onContinue}
          disabled={isLoading}
          testID="wizard-continue"
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              {loadingText ? <Text style={s.primaryBtnText}>{loadingText}</Text> : null}
            </>
          ) : (
            <Text style={s.primaryBtnText}>{primaryLabel}</Text>
          )}
        </Pressable>

        {canGoBack ? (
          <Pressable
            style={[s.textBtn, { minWidth: 56 }]}
            onPress={onExit}
            disabled={isLoading}
            testID="wizard-exit"
          >
            <Text style={[s.textBtnLabel, { color: c.danger, opacity: isLoading ? 0.4 : 1 }]}>
              {exitLabel}
            </Text>
          </Pressable>
        ) : (
          <View style={{ minWidth: 56 }} />
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  containerWeb: {
    paddingBottom: 16,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    textAlign: "center",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingBottom: 4,
  },
  textBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  textBtnLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  primaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: "#fff",
  },
});
