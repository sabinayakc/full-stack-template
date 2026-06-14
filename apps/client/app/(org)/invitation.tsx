import type { UserMetadata } from "@repo/shared";
import { ORGANIZATION_ROLE_LABELS } from "@repo/shared";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppLogo } from "@/components/ui/app-logo";
import { Button } from "@/components/ui/button";
import { confirm } from "@/components/ui/confirm-dialog";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { APP_NAME } from "@/constants/app";
import { fetchWithAuth } from "@/lib/api";
import { authClient } from "@/lib/auth";
import { useAuth } from "@/providers/auth-provider";
import { fonts, radius, useTheme } from "@/styles";

interface InvitationDetails {
  id: string;
  email: string;
  role: string;
  status: string;
  organizationName: string;
  organizationSlug: string;
  organizationId: string;
  expiresAt: string;
}

const ROLE_LABELS = ORGANIZATION_ROLE_LABELS as Record<string, string>;

export default function Invitation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, setActiveOrganization } = useAuth();
  const { colors: c } = useTheme();
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [result, setResult] = useState<"accepted" | "rejected" | null>(null);
  const isOnboarded = (user?.metadata as UserMetadata | null)?.onboarded;

  useEffect(() => {
    if (!id) return;

    authClient.organization
      .getInvitation({ query: { id } })
      .then((result) => {
        if ("error" in result && result.error) {
          setInvitation(null);
        } else if ("data" in result && result.data) {
          const data = result.data as Record<string, unknown>;
          setInvitation({
            id: data.id as string,
            email: data.email as string,
            role: data.role as string,
            status: data.status as string,
            organizationName: (data.organizationName as string) ?? "Organization",
            organizationSlug: (data.organizationSlug as string) ?? "",
            organizationId: (data.organizationId as string) ?? "",
            expiresAt: data.expiresAt as string,
          });
        } else {
          setInvitation(null);
        }
      })
      .catch(() => setInvitation(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAccept = useCallback(async () => {
    if (!invitation) return;
    setAccepting(true);
    try {
      const { error } = await authClient.organization.acceptInvitation({
        invitationId: invitation.id,
      });
      if (error) {
        await confirm({
          title: "Error",
          message: error.message ?? "Failed to accept invitation",
          confirmLabel: "OK",
          showCancel: false,
          variant: "danger",
        });
        return;
      }
      setResult("accepted");
      // Set active org, auto-link crew member by email if one exists, and navigate
      if (invitation.organizationId) {
        await setActiveOrganization(invitation.organizationId);
        // Try to link this user to an unlinked crew member with matching email
        fetchWithAuth("/crew/link", { method: "POST" }).catch(() => {});
      }
      setTimeout(
        () =>
          router.replace(
            isOnboarded ? "/(app)" : { pathname: "/(org)/onboarding", params: { skipOrg: "1" } },
          ),
        1500,
      );
    } catch {
      await confirm({
        title: "Error",
        message: "Failed to accept invitation",
        confirmLabel: "OK",
        showCancel: false,
        variant: "danger",
      });
    } finally {
      setAccepting(false);
    }
  }, [invitation, isOnboarded, setActiveOrganization, router]);

  const handleReject = useCallback(async () => {
    if (!invitation) return;
    setRejecting(true);
    try {
      const { error } = await authClient.organization.rejectInvitation({
        invitationId: invitation.id,
      });
      if (error) {
        await confirm({
          title: "Error",
          message: error.message ?? "Failed to decline invitation",
          confirmLabel: "OK",
          showCancel: false,
          variant: "danger",
        });
        return;
      }
      setResult("rejected");
    } catch {
      await confirm({
        title: "Error",
        message: "Failed to decline invitation",
        confirmLabel: "OK",
        showCancel: false,
        variant: "danger",
      });
    } finally {
      setRejecting(false);
    }
  }, [invitation]);

  if (loading) {
    return (
      <SafeAreaView style={[s.safeArea, { backgroundColor: c.bg }]}>
        <View style={[s.centerContainer, { backgroundColor: c.bg }]}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const isExpired = invitation ? new Date(invitation.expiresAt) < new Date() : false;
  const isPending = invitation?.status === "pending";

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: c.bg }]} edges={["top", "bottom"]}>
      <View style={[s.centerContainer, { backgroundColor: c.bg }]}>
        <View style={s.decorCircleLeft} />
        <View style={s.decorCircleRight} />

        <View style={s.contentWrapper}>
          {/* Logo */}
          <View style={s.logoSection}>
            <AppLogo
              size={42}
              containerStyle={[
                s.logoBox,
                { borderColor: c.border, backgroundColor: c.bgSecondary },
              ]}
              testID="invitation-logo"
            />
            <Text style={[s.appNameText, { color: c.text }]}>{APP_NAME}</Text>
          </View>

          {!invitation ? (
            <View style={s.statusSection}>
              <View style={[s.iconCircle, { backgroundColor: "rgba(239, 68, 68, 0.10)" }]}>
                <IconSymbol name="xmark.circle.fill" size={32} color={c.danger} />
              </View>
              <Text style={[s.statusTitle, { color: c.text }]}>Invitation Not Found</Text>
              <Text style={[s.statusSubtitle, { color: c.textSecondary }]}>
                This invitation may have been cancelled or the link is invalid.
              </Text>
              <Button variant="secondary" onPress={() => router.replace("/(org)/org")}>
                Go to Home
              </Button>
            </View>
          ) : result === "accepted" ? (
            <View style={s.statusSection}>
              <View style={[s.iconCircle, { backgroundColor: "rgba(16, 185, 129, 0.20)" }]}>
                <IconSymbol name="checkmark.circle.fill" size={32} color={c.success} />
              </View>
              <Text style={[s.statusTitle, { color: c.text }]}>Welcome!</Text>
              <Text style={[s.statusSubtitle, { color: c.textSecondary }]}>
                You've joined {invitation.organizationName}. Redirecting...
              </Text>
            </View>
          ) : result === "rejected" ? (
            <View style={s.statusSection}>
              <View style={[s.iconCircle, { backgroundColor: c.bgSecondary }]}>
                <IconSymbol name="xmark.circle.fill" size={24} color={c.textSecondary} />
              </View>
              <Text style={[s.statusTitle, { color: c.text }]}>Invitation Declined</Text>
              <Text style={[s.statusSubtitle, { color: c.textSecondary }]}>
                You've declined the invitation to {invitation.organizationName}.
              </Text>
              <Button variant="secondary" onPress={() => router.replace("/(org)/org")}>
                Go to Home
              </Button>
            </View>
          ) : isExpired ? (
            <View style={s.statusSection}>
              <View style={[s.iconCircle, { backgroundColor: "rgba(239, 68, 68, 0.20)" }]}>
                <IconSymbol name="xmark.circle.fill" size={32} color={c.danger} />
              </View>
              <Text style={[s.statusTitle, { color: c.text }]}>Invitation Expired</Text>
              <Text style={[s.statusSubtitle, { color: c.textSecondary }]}>
                This invitation to {invitation.organizationName} has expired. Ask the admin to send
                a new one.
              </Text>
              <Button variant="secondary" onPress={() => router.replace("/(org)/org")}>
                Go to Home
              </Button>
            </View>
          ) : !isPending ? (
            <View style={s.statusSection}>
              <Text style={[s.statusTitle, { color: c.text }]}>Invitation Already Handled</Text>
              <Text style={[s.statusSubtitle, { color: c.textSecondary }]}>
                This invitation has already been {invitation.status}.
              </Text>
              <Button variant="secondary" onPress={() => router.replace("/(org)/org")}>
                Go to Home
              </Button>
            </View>
          ) : (
            <View style={s.inviteSection}>
              <View style={s.inviteHeader}>
                <Text style={[s.statusTitle, { color: c.text }]}>You're Invited!</Text>
                <Text style={[s.statusSubtitle, { color: c.textSecondary }]}>
                  You've been invited to join
                </Text>
                <Text style={[s.orgName, { color: c.primary }]}>{invitation.organizationName}</Text>
              </View>

              <View style={[s.roleCard, { borderColor: c.border, backgroundColor: c.bgSecondary }]}>
                <Text style={[s.roleLabel, { color: c.textSecondary }]}>Role</Text>
                <Text style={[s.roleValue, { color: c.text }]}>
                  {ROLE_LABELS[invitation.role] ?? invitation.role}
                </Text>
              </View>

              <View style={s.actionsGap}>
                <Button onPress={handleAccept} isLoading={accepting} loadingText="Joining...">
                  Accept Invitation
                </Button>
                <Pressable style={s.declineBtn} onPress={handleReject} disabled={rejecting}>
                  <Text style={[s.declineBtnText, { color: c.textSecondary }]}>
                    {rejecting ? "Declining..." : "Decline"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
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
  contentWrapper: {
    width: "100%",
    maxWidth: 384,
    gap: 24,
  },
  logoSection: {
    alignItems: "center",
    gap: 8,
  },
  logoBox: {
    height: 64,
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
  },
  appNameText: {
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  statusSection: {
    alignItems: "center",
    gap: 16,
  },
  iconCircle: {
    height: 64,
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
  },
  statusTitle: {
    textAlign: "center",
    fontSize: 20,
    fontFamily: fonts.bold,
  },
  statusSubtitle: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  inviteSection: {
    gap: 20,
  },
  inviteHeader: {
    alignItems: "center",
    gap: 8,
  },
  orgName: {
    textAlign: "center",
    fontSize: 18,
    fontFamily: fonts.semibold,
  },
  roleCard: {
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  roleLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  roleValue: {
    fontSize: 16,
    fontFamily: fonts.semibold,
  },
  actionsGap: {
    gap: 12,
  },
  declineBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  declineBtnText: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
});
