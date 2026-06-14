import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { confirm } from "@/components/ui/confirm-dialog";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { fonts, radius, useTheme } from "@/styles";
import type { OnboardingState } from "./onboarding-state";

interface Props {
  state: OnboardingState;
  onChange: (state: OnboardingState) => void;
}

export function InviteStep({ state, onChange }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const { colors: c } = useTheme();

  const addInvitation = useCallback(async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      await confirm({
        title: "Invalid email",
        message: "Please enter a valid email address",
        confirmLabel: "OK",
        showCancel: false,
        variant: "warning",
      });
      return;
    }
    if (state.invitations.some((inv) => inv.email === trimmed)) {
      await confirm({
        title: "Duplicate",
        message: "This email has already been added",
        confirmLabel: "OK",
        showCancel: false,
        variant: "warning",
      });
      return;
    }
    if (state.invitations.length >= 10) {
      await confirm({
        title: "Limit reached",
        message: "You can invite up to 10 members during onboarding",
        confirmLabel: "OK",
        showCancel: false,
        variant: "info",
      });
      return;
    }
    onChange({
      ...state,
      invitations: [...state.invitations, { email: trimmed, role }],
    });
    setEmail("");
  }, [email, role, state, onChange]);

  const removeInvitation = useCallback(
    (emailToRemove: string) => {
      onChange({
        ...state,
        invitations: state.invitations.filter((inv) => inv.email !== emailToRemove),
      });
    },
    [state, onChange],
  );

  return (
    <View style={s.sectionGap}>
      <Text style={[s.hint, { color: c.textSecondary }]}>
        Invite your team members to join the organization. You can always do this later from
        settings.
      </Text>

      {/* Add form */}
      <View style={s.formGap}>
        <TextInput
          testID="onboarding-invite-email"
          style={[s.input, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]}
          placeholder="colleague@company.com"
          placeholderTextColor={c.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={addInvitation}
          returnKeyType="done"
        />

        <View style={s.roleRow}>
          <Pressable
            style={[
              s.roleBtn,
              {
                borderColor: role === "member" ? c.primary : c.border,
                backgroundColor: role === "member" ? c.bgSecondary : c.bg,
              },
            ]}
            onPress={() => setRole("member")}
            testID="onboarding-invite-role-member"
          >
            <Text style={[s.roleBtnText, { color: role === "member" ? c.primary : c.text }]}>
              Member
            </Text>
          </Pressable>
          <Pressable
            style={[
              s.roleBtn,
              {
                borderColor: role === "admin" ? c.primary : c.border,
                backgroundColor: role === "admin" ? c.bgSecondary : c.bg,
              },
            ]}
            onPress={() => setRole("admin")}
            testID="onboarding-invite-role-admin"
          >
            <Text style={[s.roleBtnText, { color: role === "admin" ? c.primary : c.text }]}>
              Admin
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={[s.addBtn, { borderColor: c.border, backgroundColor: c.bg }]}
          onPress={addInvitation}
          testID="onboarding-invite-add"
        >
          <IconSymbol name="plus" size={16} color={c.primary} />
          <Text style={[s.addBtnText, { color: c.primary }]}>Add Invitation</Text>
        </Pressable>
      </View>

      {/* List */}
      {state.invitations.length > 0 ? (
        <View style={s.listGap}>
          {state.invitations.map((inv) => (
            <View
              key={inv.email}
              style={[s.invitationRow, { borderColor: c.border, backgroundColor: c.bg }]}
            >
              <View style={s.flex1}>
                <Text style={[s.invEmail, { color: c.text }]}>{inv.email}</Text>
                <Text style={[s.invRole, { color: c.textSecondary }]}>{inv.role}</Text>
              </View>
              <Pressable
                style={s.removeBtn}
                onPress={() => removeInvitation(inv.email)}
                testID={`onboarding-invite-remove-${inv.email}`}
              >
                <IconSymbol name="xmark.circle.fill" size={20} color={c.danger} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  sectionGap: {
    gap: 20,
  },
  hint: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  formGap: {
    gap: 12,
  },
  input: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  roleRow: {
    flexDirection: "row",
    gap: 8,
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
  addBtn: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addBtnText: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  listGap: {
    gap: 8,
  },
  invitationRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  flex1: {
    flex: 1,
  },
  invEmail: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  invRole: {
    fontSize: 12,
    fontFamily: fonts.regular,
    textTransform: "capitalize",
  },
  removeBtn: {
    borderRadius: 8,
    padding: 4,
  },
});
