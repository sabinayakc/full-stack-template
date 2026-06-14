import { type DeletePreflightResult, parseOrganizationSettings } from "@repo/shared";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AvatarEditor } from "@/components/ui/avatar-editor";
import { confirm, confirmWithInput } from "@/components/ui/confirm-dialog";
import { GooglePlacesAutocompleteField } from "@/components/ui/google-places-autocomplete-field";
import { KeyboardView } from "@/components/ui/keyboard-view";
import { PhoneInput } from "@/components/ui/phone-input";
import { SettingsListItem, SettingsListSection } from "@/components/ui/settings-list";
import { fetchWithAuth } from "@/lib/api";
import { authClient } from "@/lib/auth";
import { showPreflightBlockers } from "@/lib/preflight";
import { useAuth } from "@/providers/auth-provider";
import { useQueryReset } from "@/providers/query-provider";
import { useToast } from "@/providers/toast-provider";
import { fonts, radius, spacing, useTheme } from "@/styles";

type IdentityDraft = {
  orgName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
};

function buildDraft(org: { name?: string | null; settings?: unknown }): IdentityDraft {
  const parsed = parseOrganizationSettings(org.settings);
  return {
    orgName: org.name ?? "",
    address: parsed.address ?? "",
    phone: parsed.phone ?? "",
    email: parsed.email ?? "",
    website: parsed.website ?? "",
  };
}

function normalizeDraft(d: IdentityDraft) {
  return {
    orgName: d.orgName.trim(),
    address: d.address.trim(),
    phone: d.phone.trim(),
    email: d.email.trim(),
    website: d.website.trim(),
  };
}

function draftsEqual(a: IdentityDraft, b: IdentityDraft) {
  return JSON.stringify(normalizeDraft(a)) === JSON.stringify(normalizeDraft(b));
}

export default function OrganizationScreen() {
  const { colors: c } = useTheme();
  const { activeOrganization, user, refreshOrganization } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const resetQueries = useQueryReset();
  const orgId = activeOrganization?.id;

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loadingLogo, setLoadingLogo] = useState(true);
  const [myRole, setMyRole] = useState<string | null>(null);

  const isAdminOrOwner = myRole === "admin" || myRole === "owner";

  // Identity draft
  const initialDraft = useMemo(
    () =>
      buildDraft({
        name: activeOrganization?.name,
        settings: activeOrganization?.settings,
      }),
    [activeOrganization?.name, activeOrganization?.settings],
  );

  const [savedDraft, setSavedDraft] = useState(initialDraft);
  const [draft, setDraft] = useState(initialDraft);
  const [savingIdentity, setSavingIdentity] = useState(false);

  const hasChanges = !draftsEqual(draft, savedDraft);

  useEffect(() => {
    setSavedDraft(initialDraft);
    setDraft(initialDraft);
  }, [initialDraft]);

  useFocusEffect(
    useCallback(() => {
      refreshOrganization();
    }, [refreshOrganization]),
  );

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    const loadLogo = async () => {
      setLoadingLogo(true);
      try {
        const res = await fetchWithAuth(`/organizations/${orgId}/logo-url`);
        if (!cancelled) setLogoUrl(res.url ?? null);
      } catch {
        if (!cancelled) setLogoUrl(null);
      } finally {
        if (!cancelled) setLoadingLogo(false);
      }
    };
    void loadLogo();
    return () => {
      cancelled = true;
    };
  }, [orgId]);

  useEffect(() => {
    if (!orgId || !user?.id) return;
    let cancelled = false;
    const loadRole = async () => {
      try {
        const { data } = await authClient.organization.listMembers({
          query: { organizationId: orgId, limit: 100, offset: 0 },
        });
        if (!cancelled && data) {
          const members = data as
            | Array<{ userId?: string; role?: string }>
            | { members: Array<{ userId?: string; role?: string }> };
          const list = Array.isArray(members) ? members : members.members;
          const me = list.find((m) => m.userId === user.id);
          setMyRole(me?.role ?? null);
        }
      } catch {
        if (!cancelled) setMyRole(null);
      }
    };
    void loadRole();
    return () => {
      cancelled = true;
    };
  }, [orgId, user?.id]);

  const setField = <K extends keyof IdentityDraft>(key: K, value: IdentityDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleUploadLogo = async (uri: string) => {
    if (!orgId) return;
    try {
      const { url } = await fetchWithAuth(`/organizations/${orgId}/logo-upload-url`);
      const response = await fetch(uri);
      const blob = await response.blob();
      await fetch(url, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": "image/jpeg" },
      });
      await authClient.organization.update({
        data: { logo: `organizations/${orgId}/avatar.png` },
        organizationId: orgId,
      });
      const refreshed = await fetchWithAuth(`/organizations/${orgId}/logo-url`);
      setLogoUrl(refreshed.url ?? null);
      toast.success("Logo updated.");
    } catch {
      toast.error("Failed to upload logo.");
    }
  };

  const handleSaveIdentity = async () => {
    if (!orgId || !hasChanges) return;
    setSavingIdentity(true);
    try {
      if (draft.orgName.trim() !== savedDraft.orgName.trim()) {
        const { error } = await authClient.organization.update({
          data: { name: draft.orgName.trim() },
          organizationId: orgId,
        });
        if (error) {
          toast.error(error.message ?? "Failed to update organization name.");
          return;
        }
      }
      await fetchWithAuth(`/organizations/${orgId}/settings`, {
        method: "PATCH",
        body: JSON.stringify({
          address: draft.address.trim(),
          phone: draft.phone.trim() || undefined,
          email: draft.email.trim() || undefined,
          website: draft.website.trim() || undefined,
        }),
      });
      const next = normalizeDraft(draft);
      setSavedDraft(next);
      setDraft(next);
      toast.success("Identity updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update identity.");
    } finally {
      setSavingIdentity(false);
    }
  };

  const handleLeaveOrg = async () => {
    if (!orgId) return;
    const confirmed = await confirm({
      title: "Leave Organization",
      message:
        "Are you sure you want to leave this organization? You will lose access to all its data.",
      confirmLabel: "Leave",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      const { error } = await authClient.organization.leave({ organizationId: orgId });
      if (error) {
        toast.error((error as { message?: string }).message ?? "Failed to leave organization.");
      } else {
        resetQueries();
        router.replace("/(org)/org");
      }
    } catch {
      toast.error("Failed to leave organization.");
    }
  };

  const handleDeleteOrg = async () => {
    if (!orgId) return;
    try {
      const preflight: DeletePreflightResult = await fetchWithAuth(
        `/organizations/${orgId}/delete-preflight`,
      );
      if (!preflight.canDelete) {
        await showPreflightBlockers("Cannot Delete Organization", preflight);
        return;
      }
    } catch {
      toast.error("Failed to check organization status.");
      return;
    }
    const orgNameValue = activeOrganization?.name ?? "";
    const confirmed = await confirmWithInput({
      title: "Delete Organization",
      message:
        "This will permanently delete the organization and all its data. This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
      requiredText: orgNameValue,
      inputLabel: `Type "${orgNameValue}" to confirm`,
    });
    if (!confirmed) return;
    try {
      await authClient.organization.delete({ organizationId: orgId });
      resetQueries();
      router.replace("/(org)/org");
    } catch {
      toast.error("Failed to delete organization.");
    }
  };

  return (
    <KeyboardView>
      <ScrollView
        style={[s.container, { backgroundColor: c.bg }]}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo + Name */}
        <View style={s.logoSection}>
          {loadingLogo ? (
            <View style={s.logoLoadingWrap}>
              <ActivityIndicator size="small" color={c.primary} />
            </View>
          ) : (
            <AvatarEditor
              imageUrl={logoUrl}
              fallbackText={activeOrganization?.name?.charAt(0)?.toUpperCase() ?? "O"}
              borderRadius={radius.xl}
              editable={isAdminOrOwner}
              onUpload={handleUploadLogo}
            />
          )}
          <View style={s.logoTextWrap}>
            <Text style={[s.orgTitle, { color: c.text }]}>
              {activeOrganization?.name ?? "Organization"}
            </Text>
            <Text style={[s.orgSubtitle, { color: c.textSecondary }]}>
              {activeOrganization?.slug ?? ""}
            </Text>
          </View>
        </View>

        {/* Identity */}
        {isAdminOrOwner && (
          <SettingsListSection title="Identity">
            <View style={s.fieldRow}>
              <Text style={[s.fieldLabel, { color: c.textSecondary }]}>Organization Name</Text>
              <TextInput
                style={[
                  s.fieldInput,
                  { color: c.text, borderColor: c.border, backgroundColor: c.bg },
                ]}
                value={draft.orgName}
                onChangeText={(v) => setField("orgName", v)}
                placeholder="Organization name"
                placeholderTextColor={c.textSecondary}
                autoCapitalize="words"
                testID="organization-identity-name"
              />
            </View>

            <View style={s.fieldRow}>
              <Text style={[s.fieldLabel, { color: c.textSecondary }]}>Business Address</Text>
              <GooglePlacesAutocompleteField
                value={draft.address}
                onChangeText={(v) => setField("address", v)}
                onPlaceSelected={(place) => {
                  const formatted = place.formattedAddress || place.address.addressLine1;
                  setField("address", formatted);
                }}
                placeholder="Search business address"
                showInput={true}
                inputStyle={[
                  s.fieldInput,
                  { color: c.text, borderColor: c.border, backgroundColor: c.bg },
                ]}
                initialHelperText=""
                noResultsText=""
                minQueryLength={3}
                testID="organization-identity-address"
              />
            </View>

            <View style={s.fieldRow}>
              <Text style={[s.fieldLabel, { color: c.textSecondary }]}>Phone Number</Text>
              <PhoneInput
                value={draft.phone}
                onChangeText={(formatted) => setField("phone", formatted)}
                style={{ borderColor: c.border, backgroundColor: c.bg }}
                testID="organization-identity-phone"
              />
            </View>

            <View style={s.fieldRow}>
              <Text style={[s.fieldLabel, { color: c.textSecondary }]}>Email</Text>
              <TextInput
                style={[
                  s.fieldInput,
                  { color: c.text, borderColor: c.border, backgroundColor: c.bg },
                ]}
                value={draft.email}
                onChangeText={(v) => setField("email", v)}
                placeholder="info@company.com"
                placeholderTextColor={c.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                testID="organization-identity-email"
              />
            </View>

            <View style={[s.fieldRow, s.lastFieldRow]}>
              <Text style={[s.fieldLabel, { color: c.textSecondary }]}>Website</Text>
              <TextInput
                style={[
                  s.fieldInput,
                  { color: c.text, borderColor: c.border, backgroundColor: c.bg },
                ]}
                value={draft.website}
                onChangeText={(v) => setField("website", v)}
                placeholder="https://www.company.com"
                placeholderTextColor={c.textSecondary}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                testID="organization-identity-website"
              />
            </View>

            <View style={s.identityActions}>
              <Pressable
                style={[s.cancelBtn, { borderColor: c.border, opacity: hasChanges ? 1 : 0.5 }]}
                onPress={() => setDraft(savedDraft)}
                disabled={savingIdentity || !hasChanges}
              >
                <Text style={[s.cancelBtnText, { color: c.text }]}>Reset</Text>
              </Pressable>
              <Pressable
                style={[s.saveBtn, { backgroundColor: c.primary, opacity: hasChanges ? 1 : 0.5 }]}
                onPress={handleSaveIdentity}
                disabled={savingIdentity || !hasChanges}
              >
                {savingIdentity ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.saveBtnText}>Save</Text>
                )}
              </Pressable>
            </View>
          </SettingsListSection>
        )}

        {/* Members link */}
        <SettingsListSection title="Team">
          <SettingsListItem
            icon="person.2.fill"
            label="Members"
            subtitle="Invite, manage, and remove members"
            onPress={() => router.push("/(app)/settings/organization/members" as never)}
            isLast
          />
        </SettingsListSection>

        {/* Danger Zone */}
        <SettingsListSection title="Danger Zone">
          {myRole !== "owner" && (
            <SettingsListItem
              icon="rectangle.portrait.and.arrow.right.fill"
              label="Leave Organization"
              subtitle="Remove yourself from this organization"
              destructive
              showChevron={false}
              onPress={handleLeaveOrg}
              isLast={!isAdminOrOwner}
            />
          )}
          {isAdminOrOwner && (
            <SettingsListItem
              icon="trash.fill"
              label="Delete Organization"
              subtitle="Permanently delete this organization and all its data"
              destructive
              showChevron={false}
              onPress={handleDeleteOrg}
              isLast
            />
          )}
        </SettingsListSection>
      </ScrollView>
    </KeyboardView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 48,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  logoLoadingWrap: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  logoTextWrap: {
    flex: 1,
    gap: 4,
  },
  orgTitle: {
    fontSize: 18,
    fontFamily: fonts.semibold,
  },
  orgSubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    lineHeight: 18,
  },
  fieldRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  lastFieldRow: {
    paddingBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  fieldInput: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  identityActions: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  saveBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: fonts.semibold,
  },
});
