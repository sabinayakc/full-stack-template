import { MAX_ORGANIZATIONS } from "@repo/shared";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { confirm } from "@/components/ui/confirm-dialog";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { authClient } from "@/lib/auth";
import { useAuth } from "@/providers/auth-provider";
import { fonts, radius, useTheme } from "@/styles";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

export default function SelectOrganization() {
  const router = useRouter();
  const { colors: c } = useTheme();
  const { user, isLoading: authLoading, activeOrganization, setActiveOrganization } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);

  // Redirect non-onboarded users to onboarding or invitation.
  // Skip if user already has an active org (they navigated here intentionally).
  useEffect(() => {
    if (authLoading) return;
    if (activeOrganization) return;
    const metadata = user?.metadata;
    if (metadata?.onboarded) return;

    authClient.organization
      .listUserInvitations()
      .then(({ data }) => {
        const pending = data?.filter((inv: { status: string }) => inv.status === "pending");
        if (pending && pending.length > 0) {
          router.replace({
            pathname: "/(org)/invitation",
            params: { id: pending[0].id },
          });
        } else {
          router.replace("/(org)/onboarding");
        }
      })
      .catch(() => {
        router.replace("/(org)/onboarding");
      });
  }, [authLoading, user, activeOrganization, router]);

  useEffect(() => {
    authClient.organization.list().then(({ data }) => {
      if (data) setOrganizations(data);
      setLoading(false);
    });
  }, []);

  const handleSelect = useCallback(
    async (org: Organization) => {
      setSwitching(org.id);
      try {
        await setActiveOrganization(org.id);
        router.replace("/(app)");
      } catch {
        await confirm({
          title: "Error",
          message: "Failed to select organization",
          confirmLabel: "OK",
          showCancel: false,
          variant: "danger",
        });
      } finally {
        setSwitching(null);
      }
    },
    [setActiveOrganization, router],
  );

  if (loading) {
    return <LoadingScreen backgroundColor={c.bg} showSpinner spinnerColor={c.textSecondary} />;
  }

  return (
    <ScrollView
      contentContainerStyle={s.scrollContent}
      style={[s.flex1, { backgroundColor: c.bg }]}
    >
      <View style={s.mainGap}>
        <View style={s.headerGap}>
          <Text style={[s.title, { color: c.text }]}>App</Text>
          <Text style={[s.subtitle, { color: c.textSecondary }]}>
            {organizations.length > 0
              ? "Select an organization to continue"
              : "Create your first organization to get started"}
          </Text>
        </View>

        {organizations.length > 0 && (
          <View style={s.listGap}>
            {organizations.map((org) => {
              const isSwitching = switching === org.id;

              return (
                <Pressable
                  key={org.id}
                  style={[s.orgRow, { borderColor: c.border, backgroundColor: c.bgSecondary }]}
                  onPress={() => handleSelect(org)}
                  disabled={isSwitching}
                >
                  <View style={[s.orgIcon, { backgroundColor: c.primarySubtle }]}>
                    <IconSymbol name="building.2.fill" size={20} color="#0a7ea4" />
                  </View>
                  <View style={s.flex1}>
                    <Text style={[s.orgName, { color: c.text }]}>{org.name}</Text>
                    <Text style={[s.orgSlug, { color: c.textSecondary }]}>{org.slug}</Text>
                  </View>
                  {isSwitching ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <IconSymbol name="chevron.right" size={16} color="#9ca3af" />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {organizations.length >= MAX_ORGANIZATIONS ? (
          <View style={[s.createBtn, { borderColor: c.border, opacity: 0.5 }]}>
            <Text style={[s.createBtnText, { color: c.textSecondary }]}>
              Maximum organizations reached ({MAX_ORGANIZATIONS})
            </Text>
          </View>
        ) : (
          <Pressable
            style={[s.createBtn, { borderColor: c.border }]}
            onPress={() => router.push("/(org)/onboarding?newOrg=1")}
          >
            <IconSymbol name="plus" size={16} color="#0a7ea4" />
            <Text style={[s.createBtnText, { color: c.primary }]}>Create New Organization</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  mainGap: {
    gap: 32,
  },
  headerGap: {
    gap: 8,
  },
  title: {
    fontSize: 30,
    fontFamily: fonts.bold,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  listGap: {
    gap: 8,
  },
  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  orgIcon: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  orgName: {
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  orgSlug: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    paddingVertical: 16,
  },
  createBtnText: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
});
