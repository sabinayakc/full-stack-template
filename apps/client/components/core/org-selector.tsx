import { MAX_ORGANIZATIONS } from "@repo/shared";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AppModal } from "@/components/ui/app-modal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { fetchWithAuth } from "@/lib/api";
import { authClient } from "@/lib/auth";
import { useAuth } from "@/providers/auth-provider";
import { fonts, radius, spacing, useTheme } from "@/styles";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

export function OrgSelector({ onNavigate }: { onNavigate?: () => void } = {}) {
  const router = useRouter();
  const { activeOrganization, setActiveOrganization } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [visible, setVisible] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoUrls, setLogoUrls] = useState<Record<string, string>>({});
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});
  const { colors: c } = useTheme();

  const loadLogoUrls = useCallback((orgs: Organization[]) => {
    for (const org of orgs) {
      fetchWithAuth(`/organizations/${org.id}/logo-url`)
        .then((res) => {
          if (res.url) {
            setLogoUrls((prev) => ({ ...prev, [org.id]: res.url }));
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    authClient.organization.list().then(({ data }) => {
      if (data) {
        setOrganizations(data);
        loadLogoUrls(data);
      }
      setLoading(false);
    });
  }, [loadLogoUrls]);

  const handleSwitch = useCallback(
    async (org: Organization) => {
      if (org.id === activeOrganization?.id) {
        setVisible(false);
        return;
      }
      setSwitching(org.id);
      setVisible(false);
      onNavigate?.();
      try {
        await setActiveOrganization(org.id);
      } finally {
        setSwitching(null);
      }
    },
    [activeOrganization?.id, setActiveOrganization, onNavigate],
  );

  // Refresh logo URLs each time the dropdown is opened
  useEffect(() => {
    if (visible && organizations.length > 0) {
      loadLogoUrls(organizations);
    }
  }, [visible, organizations, loadLogoUrls]);

  const handleCreate = useCallback(() => {
    setVisible(false);
    router.push("/(org)/onboarding?newOrg=1");
  }, [router]);

  if (loading) {
    return (
      <View style={[s.triggerLoading, { backgroundColor: c.surface }]}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (organizations.length === 0) return null;

  return (
    <>
      <Pressable
        style={[s.trigger, { backgroundColor: c.surface }]}
        onPress={() => setVisible(true)}
      >
        <View style={[s.orgBadge, { backgroundColor: c.primaryMuted }]}>
          {activeOrganization?.id &&
          logoUrls[activeOrganization.id] &&
          !logoErrors[activeOrganization.id] ? (
            <Image
              source={{ uri: logoUrls[activeOrganization.id] }}
              style={s.orgBadgeImage}
              onError={() => setLogoErrors((prev) => ({ ...prev, [activeOrganization.id]: true }))}
            />
          ) : (
            <Text style={[s.orgBadgeText, { color: c.text }]}>
              {activeOrganization?.name?.charAt(0)?.toUpperCase() ?? "O"}
            </Text>
          )}
        </View>
        <Text style={[s.triggerText, { color: c.text }]} numberOfLines={1}>
          {activeOrganization?.name ?? "Select Org"}
        </Text>
        <IconSymbol name="chevron.down" size={16} color={c.textSecondary} />
      </Pressable>

      <AppModal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={s.overlay} onPress={() => setVisible(false)}>
          <Pressable style={[s.dropdown, { backgroundColor: c.bg }]} onPress={() => {}}>
            <Text style={[s.dropdownTitle, { color: c.textSecondary }]}>Organizations</Text>

            {organizations.map((org) => {
              const isActive = org.id === activeOrganization?.id;
              const isSwitching = switching === org.id;

              return (
                <Pressable
                  key={org.id}
                  style={[s.orgRow, isActive && { backgroundColor: c.primarySubtle }]}
                  onPress={() => handleSwitch(org)}
                  disabled={isSwitching}
                >
                  <View
                    style={[
                      s.orgRowBadge,
                      { backgroundColor: isActive ? c.primaryMuted : c.surface },
                    ]}
                  >
                    {logoUrls[org.id] && !logoErrors[org.id] ? (
                      <Image
                        source={{ uri: logoUrls[org.id] }}
                        style={s.orgRowBadgeImage}
                        onError={() => setLogoErrors((prev) => ({ ...prev, [org.id]: true }))}
                      />
                    ) : (
                      <Text
                        style={[s.orgBadgeText, { color: isActive ? c.primary : c.textSecondary }]}
                      >
                        {org.name.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[s.orgRowText, { color: isActive ? c.primary : c.text }]}
                    numberOfLines={1}
                  >
                    {org.name}
                  </Text>
                  {isSwitching ? (
                    <ActivityIndicator size="small" />
                  ) : isActive ? (
                    <IconSymbol name="checkmark" size={16} color={c.primary} />
                  ) : null}
                </Pressable>
              );
            })}

            <View style={[s.dropdownDivider, { backgroundColor: c.border }]} />
            {organizations.length < MAX_ORGANIZATIONS ? (
              <Pressable style={s.orgRow} onPress={handleCreate}>
                <View style={[s.orgRowBadge, { backgroundColor: c.surface }]}>
                  <IconSymbol name="plus" size={14} color={c.textSecondary} />
                </View>
                <Text style={[s.orgRowText, { color: c.textSecondary }]}>Create Organization</Text>
              </Pressable>
            ) : (
              <Text style={[s.limitText, { color: c.textSecondary }]}>
                Organization limit reached ({MAX_ORGANIZATIONS})
              </Text>
            )}
          </Pressable>
        </Pressable>
      </AppModal>
    </>
  );
}

const s = StyleSheet.create({
  // Trigger button
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.lg,
    paddingHorizontal: 10,
    paddingVertical: spacing.sm,
  },
  triggerLoading: {
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  orgBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  orgBadgeText: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  orgBadgeImage: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
  },

  // Dropdown modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  dropdown: {
    marginHorizontal: spacing.lg,
    marginTop: 96,
    borderRadius: radius.xl,
    padding: spacing.sm,
  },
  dropdownTitle: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
  },
  dropdownDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: spacing.md,
    marginVertical: 6,
  },

  // Org rows
  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  orgRowBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  orgRowBadgeImage: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
  },
  orgRowText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  limitText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    textAlign: "center",
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
});
