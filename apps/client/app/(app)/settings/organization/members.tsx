import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { confirm } from "@/components/ui/confirm-dialog";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { KeyboardView } from "@/components/ui/keyboard-view";
import { SettingsListSection } from "@/components/ui/settings-list";
import { authClient } from "@/lib/auth";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { fonts, radius, spacing, useTheme } from "@/styles";

interface Member {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  inviterId: string;
  status: string;
  expiresAt: string | Date;
  createdAt: string | Date;
}

const MEMBERS_PAGE_SIZE = 20;

export default function MembersScreen() {
  const { colors: c } = useTheme();
  const { activeOrganization, user } = useAuth();
  const toast = useToast();
  const orgId = activeOrganization?.id;

  const [members, setMembers] = useState<Member[]>([]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersLoadingMore, setMembersLoadingMore] = useState(false);
  const [myRole, setMyRole] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(true);
  const [cancellingInviteId, setCancellingInviteId] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviting, setInviting] = useState(false);

  const isAdminOrOwner = myRole === "admin" || myRole === "owner";

  const loadMembers = useCallback(
    async (offset = 0) => {
      if (!orgId) return;
      const isInitial = offset === 0;
      if (isInitial) setMembersLoading(true);
      else setMembersLoadingMore(true);
      try {
        const { data } = await authClient.organization.listMembers({
          query: { organizationId: orgId, limit: MEMBERS_PAGE_SIZE, offset },
        });
        if (data) {
          const result = data as { members: Member[]; total: number };
          if (isInitial) {
            setMembers(result.members);
          } else {
            setMembers((prev) => [...prev, ...result.members]);
          }
          setMembersTotal(result.total);
          const me = result.members.find((m) => m.userId === user?.id);
          if (me) setMyRole(me.role);
        }
      } finally {
        if (isInitial) setMembersLoading(false);
        else setMembersLoadingMore(false);
      }
    },
    [orgId, user?.id],
  );

  const loadInvitations = useCallback(async () => {
    if (!orgId) return;
    setInvitationsLoading(true);
    try {
      const { data } = await authClient.organization.listInvitations({
        query: { organizationId: orgId },
      });
      if (data) {
        const pending = (data as Invitation[]).filter((inv) => inv.status === "pending");
        setInvitations(pending);
      }
    } finally {
      setInvitationsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadMembers();
    loadInvitations();
  }, [loadMembers, loadInvitations]);

  const handleInvite = async () => {
    if (!orgId) return;
    const trimmed = inviteEmail.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.warning("Please enter a valid email address.");
      return;
    }
    setInviting(true);
    try {
      const { error } = await authClient.organization.inviteMember({
        email: trimmed,
        role: inviteRole,
        organizationId: orgId,
      });
      if (error) {
        toast.error(error.message ?? "Failed to send invitation.");
      } else {
        toast.success(`Invitation sent to ${trimmed}.`);
        setInviteEmail("");
        loadInvitations();
      }
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvitation = async (invitation: Invitation) => {
    if (!orgId) return;
    const confirmed = await confirm({
      title: "Cancel Invitation",
      message: `Cancel the pending invitation to ${invitation.email}?`,
      confirmLabel: "Cancel Invitation",
      variant: "danger",
    });
    if (!confirmed) return;
    setCancellingInviteId(invitation.id);
    try {
      const { error } = await authClient.organization.cancelInvitation({
        invitationId: invitation.id,
      });
      if (error) {
        toast.error((error as { message?: string }).message ?? "Failed to cancel invitation.");
      } else {
        setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id));
        toast.success(`Invitation to ${invitation.email} cancelled.`);
      }
    } catch {
      toast.error("Failed to cancel invitation.");
    } finally {
      setCancellingInviteId(null);
    }
  };

  const handleRemoveMember = async (member: Member) => {
    if (!orgId) return;
    const confirmed = await confirm({
      title: "Remove Member",
      message: `Remove ${member.user.name} (${member.user.email}) from the organization?`,
      confirmLabel: "Remove",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      await authClient.organization.removeMember({
        memberIdOrEmail: member.id,
        organizationId: orgId,
      });
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      toast.success(`${member.user.name} has been removed.`);
    } catch {
      toast.error("Failed to remove member.");
    }
  };

  const handleUpdateRole = async (member: Member, newRole: string) => {
    if (!orgId) return;
    try {
      await authClient.organization.updateMemberRole({
        memberId: member.id,
        role: newRole,
        organizationId: orgId,
      });
      setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role: newRole } : m)));
      toast.success(`${member.user.name} is now ${newRole}.`);
    } catch {
      toast.error("Failed to update role.");
    }
  };

  return (
    <KeyboardView>
      <ScrollView
        style={[s.container, { backgroundColor: c.bg }]}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Invite members */}
        {isAdminOrOwner && (
          <SettingsListSection title="Invite Members">
            <View style={s.inviteForm}>
              <TextInput
                style={[
                  s.inviteInput,
                  { color: c.text, borderColor: c.border, backgroundColor: c.bg },
                ]}
                placeholder="colleague@company.com"
                placeholderTextColor={c.textSecondary}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={s.roleRow}>
                {(["member", "admin"] as const).map((r) => (
                  <Pressable
                    key={r}
                    style={[
                      s.roleBtn,
                      {
                        borderColor: inviteRole === r ? c.primary : c.border,
                        backgroundColor: inviteRole === r ? c.primarySubtle : c.bg,
                      },
                    ]}
                    onPress={() => setInviteRole(r)}
                  >
                    <Text style={[s.roleBtnText, { color: inviteRole === r ? c.primary : c.text }]}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                style={[s.inviteBtn, { backgroundColor: c.primary }]}
                onPress={handleInvite}
                disabled={inviting}
              >
                {inviting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.inviteBtnText}>Send Invitation</Text>
                )}
              </Pressable>
            </View>
          </SettingsListSection>
        )}

        {/* Pending invitations */}
        {isAdminOrOwner && invitations.length > 0 && (
          <SettingsListSection title="Pending Invitations">
            {invitationsLoading ? (
              <View style={s.loadingRow}>
                <ActivityIndicator size="small" />
              </View>
            ) : (
              invitations.map((invitation, index) => (
                <View
                  key={invitation.id}
                  style={[
                    s.memberRow,
                    index < invitations.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: c.border,
                    },
                  ]}
                >
                  <View style={[s.memberAvatar, { backgroundColor: c.primaryMuted }]}>
                    <IconSymbol name="envelope.fill" size={16} color={c.primary} />
                  </View>
                  <View style={s.memberInfo}>
                    <Text style={[s.memberName, { color: c.text }]}>{invitation.email}</Text>
                    <Text style={[s.memberEmail, { color: c.textSecondary }]}>
                      Invited as {invitation.role}
                    </Text>
                  </View>
                  <Pressable
                    style={s.removeBtn}
                    onPress={() => handleCancelInvitation(invitation)}
                    disabled={cancellingInviteId === invitation.id}
                  >
                    {cancellingInviteId === invitation.id ? (
                      <ActivityIndicator size="small" />
                    ) : (
                      <IconSymbol name="xmark.circle.fill" size={20} color={c.danger} />
                    )}
                  </Pressable>
                </View>
              ))
            )}
          </SettingsListSection>
        )}

        {/* Members list */}
        <SettingsListSection title={`Members${membersTotal > 0 ? ` (${membersTotal})` : ""}`}>
          {membersLoading ? (
            <View style={s.loadingRow}>
              <ActivityIndicator size="small" />
            </View>
          ) : members.length === 0 ? (
            <View style={s.emptyRow}>
              <Text style={[s.emptyText, { color: c.textSecondary }]}>No members found.</Text>
            </View>
          ) : (
            <>
              {members.map((member, index) => {
                const isMe = member.userId === user?.id;
                const isOwner = member.role === "owner";
                const canRemove = isAdminOrOwner && !isMe && !isOwner;
                const canChangeRole = isAdminOrOwner && !isMe && !isOwner;

                return (
                  <View
                    key={member.id}
                    style={[
                      s.memberRow,
                      (index < members.length - 1 || members.length < membersTotal) && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: c.border,
                      },
                    ]}
                  >
                    <View style={[s.memberAvatar, { backgroundColor: c.primaryMuted }]}>
                      <Text style={[s.memberAvatarText, { color: c.primary }]}>
                        {member.user.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </Text>
                    </View>
                    <View style={s.memberInfo}>
                      <Text style={[s.memberName, { color: c.text }]}>
                        {member.user.name}
                        {isMe ? " (You)" : ""}
                      </Text>
                      <Text style={[s.memberEmail, { color: c.textSecondary }]}>
                        {member.user.email}
                      </Text>
                    </View>
                    {canChangeRole ? (
                      <Pressable
                        style={[s.rolePill, { borderColor: c.border }]}
                        onPress={() =>
                          handleUpdateRole(member, member.role === "admin" ? "member" : "admin")
                        }
                      >
                        <Text style={[s.rolePillText, { color: c.primary }]}>{member.role}</Text>
                      </Pressable>
                    ) : (
                      <View style={[s.rolePill, { borderColor: c.border }]}>
                        <Text style={[s.rolePillText, { color: c.textSecondary }]}>
                          {member.role}
                        </Text>
                      </View>
                    )}
                    {canRemove && (
                      <Pressable style={s.removeBtn} onPress={() => handleRemoveMember(member)}>
                        <IconSymbol name="xmark.circle.fill" size={20} color={c.danger} />
                      </Pressable>
                    )}
                  </View>
                );
              })}
              {members.length < membersTotal && (
                <Pressable
                  style={s.loadMoreRow}
                  onPress={() => loadMembers(members.length)}
                  disabled={membersLoadingMore}
                >
                  {membersLoadingMore ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Text style={[s.loadMoreText, { color: c.primary }]}>
                      Load More ({membersTotal - members.length} remaining)
                    </Text>
                  )}
                </Pressable>
              )}
            </>
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
  inviteForm: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  inviteInput: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  roleRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  roleBtn: {
    flex: 1,
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: 10,
  },
  roleBtnText: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  inviteBtn: {
    height: 44,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  inviteBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontFamily: fonts.semibold,
  },
  loadingRow: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyRow: {
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  memberAvatarText: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  memberEmail: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  rolePill: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rolePillText: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    textTransform: "capitalize",
  },
  removeBtn: {
    padding: 4,
  },
  loadMoreRow: {
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreText: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
});
