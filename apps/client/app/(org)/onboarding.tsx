import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { InviteStep } from "@/components/onboarding/invite-step";
import {
  INITIAL_ONBOARDING_STATE,
  type OnboardingState,
} from "@/components/onboarding/onboarding-state";
import { OrganizationStep } from "@/components/onboarding/organization-step";
import { PreferencesStep } from "@/components/onboarding/preferences-step";
import { SummaryStep } from "@/components/onboarding/summary-step";
import { Button } from "@/components/ui/button";
import { confirm } from "@/components/ui/confirm-dialog";
import { KeyboardView } from "@/components/ui/keyboard-view";
import { StepWizard, type WizardStep } from "@/components/ui/step-wizard";
import { fetchWithAuth } from "@/lib/api";
import { authClient } from "@/lib/auth";
import { useAuth } from "@/providers/auth-provider";
import { fonts, radius, spacing, useTheme } from "@/styles";

export default function Onboarding() {
  const { skipOrg, newOrg } = useLocalSearchParams<{ skipOrg?: string; newOrg?: string }>();
  const isJoiningViaInvite = skipOrg === "1";
  const isNewOrgOnly = newOrg === "1";
  const router = useRouter();
  const { colors: c } = useTheme();
  const { setActiveOrganization } = useAuth();
  const [state, setState] = useState<OnboardingState>(INITIAL_ONBOARDING_STATE);
  const [organizationErrors, setOrganizationErrors] = useState<{ name?: string; slug?: string }>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = useCallback(async () => {
    const confirmed = await confirm({
      title: "Leave Setup",
      message: "Are you sure you want to leave? Your progress will be lost.",
      confirmLabel: "Leave",
      variant: "danger",
    });
    if (confirmed) router.replace("/(org)/org");
  }, [router]);

  const handleStateChange = useCallback((nextState: OnboardingState) => {
    setState(nextState);
    setOrganizationErrors((current) => ({
      name: current.name && nextState.organization.name.trim() ? undefined : current.name,
      slug:
        current.slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(nextState.organization.slug)
          ? undefined
          : current.slug,
    }));
  }, []);

  const handleComplete = useCallback(async () => {
    setSubmitting(true);
    try {
      if (isJoiningViaInvite) {
        await fetchWithAuth("/onboarding/complete-invite", {
          method: "POST",
          body: JSON.stringify({ userPreferences: state.userPreferences }),
        });
      } else {
        const data = await fetchWithAuth("/onboarding/complete", {
          method: "POST",
          body: JSON.stringify(state),
        });

        // Set the active organization
        if (data.organizationId) {
          await setActiveOrganization(data.organizationId);
        }
      }

      router.replace("/(app)");
      // Keep submitting=true so the wizard stays in loading state until the screen unmounts
    } catch (error) {
      setSubmitting(false);
      void confirm({
        title: "Error",
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        confirmLabel: "OK",
        showCancel: false,
        variant: "danger",
      });
    }
  }, [router, setActiveOrganization, state, isJoiningViaInvite]);

  const allSteps: WizardStep[] = useMemo(
    () => [
      {
        id: "organization",
        title: "Set Up Your Organization",
        subtitle: "Tell us about your company so we can tailor the experience",
        content: (
          <OrganizationStep
            state={state}
            onChange={handleStateChange}
            errors={organizationErrors}
          />
        ),
        validate: async () => {
          const nextErrors: { name?: string; slug?: string } = {};

          if (!state.organization.name.trim()) {
            nextErrors.name = "Organization name is required";
          }

          if (!state.organization.slug.trim()) {
            nextErrors.slug = "URL slug is required";
          } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(state.organization.slug)) {
            nextErrors.slug = "Slug must be lowercase with dashes only";
          }

          // Check slug availability if no local errors on slug
          if (!nextErrors.slug) {
            const { data } = await authClient.organization.checkSlug({
              slug: state.organization.slug,
            });
            if (!data?.status) {
              nextErrors.slug = "This slug is already taken";
            }
          }

          setOrganizationErrors(nextErrors);

          if (Object.keys(nextErrors).length > 0) return "";

          return true;
        },
      },
      {
        id: "preferences",
        title: "Your Preferences",
        subtitle: "Customize how the app works for you",
        content: <PreferencesStep state={state} onChange={setState} />,
      },
      {
        id: "invite",
        title: "Invite Your Team",
        subtitle: "Add team members to your organization",
        content: <InviteStep state={state} onChange={setState} />,
      },
      {
        id: "summary",
        title: "Review & Finish",
        subtitle: "Review your setup before we create everything",
        content: <SummaryStep state={state} />,
      },
    ],
    [handleStateChange, organizationErrors, state],
  );

  const steps = useMemo(() => {
    if (isJoiningViaInvite) {
      // Joining via invitation: only preferences
      return allSteps.filter((s) => s.id === "preferences");
    }
    if (isNewOrgOnly) {
      // Already onboarded, creating a new org: skip preferences
      return allSteps.filter((s) => s.id !== "preferences");
    }
    return allSteps;
  }, [allSteps, isJoiningViaInvite, isNewOrgOnly]);

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: c.bg }]} edges={["top", "bottom"]}>
      <KeyboardView>
        <View style={[s.flex1, { backgroundColor: c.bg }]}>
          {/* Decorative circles */}
          <View style={s.decorCircleLeft} />
          <View style={s.decorCircleRight} />

          <ScrollView
            contentContainerStyle={s.scrollContent}
            style={s.flex1}
            contentInsetAdjustmentBehavior="always"
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[
                s.wizardCard,
                {
                  backgroundColor: c.bgSecondary,
                  borderColor: c.border,
                },
              ]}
            >
              <StepWizard
                steps={steps}
                onComplete={handleComplete}
                renderFooter={(helpers) => (
                  <View style={s.footerContainer}>
                    <Button
                      testID="onboarding-next"
                      onPress={() => helpers.goNext()}
                      isLoading={submitting || helpers.isValidating}
                      loadingText={
                        helpers.isLastStep
                          ? "Setting up..."
                          : helpers.isValidating
                            ? "Checking..."
                            : undefined
                      }
                    >
                      {helpers.isLastStep ? "Complete Setup" : "Continue"}
                    </Button>

                    {helpers.canGoBack ? (
                      <Pressable style={s.backBtn} onPress={helpers.goBack}>
                        <Text style={[s.backBtnText, { color: c.textSecondary }]}>Back</Text>
                      </Pressable>
                    ) : null}

                    {isNewOrgOnly ? (
                      <Pressable style={s.cancelBtn} onPress={handleCancel}>
                        <Text style={[s.cancelBtnText, { color: c.danger }]}>Cancel</Text>
                      </Pressable>
                    ) : null}
                  </View>
                )}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  decorCircleLeft: {
    position: "absolute",
    left: -40,
    top: 80,
    height: 144,
    width: 144,
    borderRadius: 72,
    backgroundColor: "rgba(14, 165, 233, 0.06)",
  },
  decorCircleRight: {
    position: "absolute",
    right: -48,
    bottom: 80,
    height: 176,
    width: 176,
    borderRadius: 88,
    backgroundColor: "rgba(245, 158, 11, 0.10)",
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  wizardCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
  footerContainer: {
    gap: 12,
    paddingBottom: 16,
    paddingTop: 8,
  },
  backBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  backBtnText: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
});
