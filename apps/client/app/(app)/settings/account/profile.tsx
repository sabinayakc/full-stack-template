import { useEffect, useRef, useState } from "react";
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
import { IconSymbol } from "@/components/ui/icon-symbol";
import { KeyboardView } from "@/components/ui/keyboard-view";
import { PhoneInput } from "@/components/ui/phone-input";
import { SettingsListSection } from "@/components/ui/settings-list";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import { fetchWithAuth } from "@/lib/api";
import { authClient } from "@/lib/auth";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { fonts, radius, spacing, useTheme } from "@/styles";

const RESEND_COOLDOWN_SECONDS = 60;

export default function ProfileScreen() {
  const { colors: c } = useTheme();
  const { user } = useAuth();
  const toast = useToast();

  // Profile fields
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const { avatarUrl, invalidate: invalidateAvatar } = useAvatarUrl();

  // Email verification
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Preferences
  const currentJobTitle = user?.metadata?.jobTitle ?? "";
  const [jobTitle, setJobTitle] = useState(currentJobTitle);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState(false);

  // Phone number
  const [phoneDigits, setPhoneDigits] = useState(user?.phoneNumber?.replace(/\D/g, "") ?? "");
  const [editingPhone, setEditingPhone] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const nameChanged = name.trim() !== (user?.name ?? "");
  const emailChanged = email.trim().toLowerCase() !== (user?.email ?? "");
  const hasProfileChanges = nameChanged || emailChanged;

  const hasPreferencesChanges = jobTitle.trim() !== currentJobTitle;

  // Clean up cooldown interval
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleUploadAvatar = async (uri: string) => {
    try {
      const contentType = "image/jpeg";
      const { url, key } = await fetchWithAuth(
        `/organizations/user/avatar-upload-url?contentType=${contentType}`,
      );
      const response = await fetch(uri);
      const blob = await response.blob();
      await fetch(url, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": contentType },
      });
      await authClient.updateUser({ image: key });
      await invalidateAvatar();
      toast.success("Avatar updated.");
    } catch {
      toast.error("Failed to upload avatar.");
    }
  };

  const handleSaveProfile = async () => {
    if (!hasProfileChanges) {
      setEditingProfile(false);
      return;
    }
    setSavingProfile(true);
    try {
      // Update name
      if (nameChanged) {
        const trimmed = name.trim();
        if (!trimmed) {
          toast.warning("Name cannot be empty.");
          return;
        }
        const { error } = await authClient.updateUser({ name: trimmed });
        if (error) {
          toast.error(error.message ?? "Failed to update name.");
          return;
        }
      }

      // Change email
      if (emailChanged) {
        const trimmed = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          toast.warning("Please enter a valid email address.");
          return;
        }
        const { error } = await authClient.changeEmail({ newEmail: trimmed });
        if (error) {
          toast.error(error.message ?? "Failed to change email.");
          return;
        }
        toast.success("A verification email has been sent to your new address.");
      } else {
        toast.success("Profile updated.");
      }

      setEditingProfile(false);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setEditingProfile(false);
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    try {
      const result = await authClient.sendVerificationEmail({ email: user?.email ?? "" });
      if (result.error) {
        toast.error(result.error.message ?? "Failed to send verification email.");
      } else {
        toast.success("Verification email sent.");
        startCooldown();
      }
    } finally {
      setResending(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (phoneDigits.length !== 10) {
      toast.warning("Please enter a valid 10-digit phone number.");
      return;
    }
    setSavingPhone(true);
    try {
      const phoneE164 = `+1${phoneDigits}`;
      const { error } = await authClient.phoneNumber.sendOtp({ phoneNumber: phoneE164 });
      if (error) {
        toast.error(error.message ?? "Failed to send verification code.");
      } else {
        setOtpSent(true);
        toast.success("Verification code sent.");
      }
    } finally {
      setSavingPhone(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (otpCode.length !== 6) {
      toast.warning("Please enter the 6-digit code.");
      return;
    }
    setVerifying(true);
    try {
      const phoneE164 = `+1${phoneDigits}`;
      const { error } = await authClient.phoneNumber.verify({
        phoneNumber: phoneE164,
        code: otpCode,
        updatePhoneNumber: true,
      });
      if (error) {
        toast.error(error.message ?? "Invalid verification code.");
      } else {
        toast.success("Phone number verified.");
        setEditingPhone(false);
        setOtpSent(false);
        setOtpCode("");
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleCancelPhone = () => {
    setPhoneDigits(user?.phoneNumber?.replace(/\D/g, "") ?? "");
    setEditingPhone(false);
    setOtpSent(false);
    setOtpCode("");
  };

  const handleSavePreferences = async () => {
    if (!hasPreferencesChanges) {
      setEditingPreferences(false);
      return;
    }
    setSavingPreferences(true);
    try {
      const updatedMetadata = {
        ...user?.metadata,
        jobTitle: jobTitle.trim() || undefined,
      };
      const { error } = await authClient.updateUser({
        metadata: updatedMetadata,
      } as Record<string, unknown>);
      if (error) {
        toast.error(error.message ?? "Failed to update preferences.");
      } else {
        toast.success("Preferences updated.");
        setEditingPreferences(false);
      }
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleCancelPreferences = () => {
    setJobTitle(currentJobTitle);
    setEditingPreferences(false);
  };

  return (
    <KeyboardView>
      <ScrollView
        style={[s.container, { backgroundColor: c.bg }]}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={s.avatarSection}>
          <AvatarEditor
            imageUrl={avatarUrl}
            fallbackText={user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            onUpload={handleUploadAvatar}
          />
        </View>

        {/* Profile */}
        <SettingsListSection
          title="Profile"
          right={
            !editingProfile ? (
              <Pressable style={s.editBtn} onPress={() => setEditingProfile(true)} hitSlop={8}>
                <IconSymbol name="square.and.pencil" size={16} color={c.primary} />
                <Text style={[s.editBtnLabel, { color: c.primary }]}>Edit</Text>
              </Pressable>
            ) : undefined
          }
        >
          {editingProfile ? (
            <>
              <View style={s.fieldRow}>
                <Text style={[s.fieldLabel, { color: c.textSecondary }]}>Name</Text>
                <TextInput
                  style={[
                    s.fieldInput,
                    { color: c.text, borderColor: c.border, backgroundColor: c.bg },
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={c.textSecondary}
                  autoCapitalize="words"
                  autoFocus
                />
              </View>
              <View style={s.fieldRow}>
                <Text style={[s.fieldLabel, { color: c.textSecondary }]}>Email</Text>
                <TextInput
                  style={[
                    s.fieldInput,
                    { color: c.text, borderColor: c.border, backgroundColor: c.bg },
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor={c.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {emailChanged && (
                  <Text style={[s.hint, { color: c.textSecondary }]}>
                    Changing your email will require verification.
                  </Text>
                )}
              </View>
              <View style={s.editActions}>
                <Pressable
                  style={[s.cancelBtn, { borderColor: c.border }]}
                  onPress={handleCancelProfile}
                >
                  <Text style={[s.cancelBtnText, { color: c.text }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[
                    s.actionBtn,
                    { backgroundColor: c.primary, opacity: hasProfileChanges ? 1 : 0.5 },
                  ]}
                  onPress={handleSaveProfile}
                  disabled={savingProfile || !hasProfileChanges}
                >
                  {savingProfile ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={s.actionBtnText}>Save</Text>
                  )}
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View style={s.readonlyRow}>
                <Text style={[s.fieldLabel, { color: c.textSecondary }]}>Name</Text>
                <Text style={[s.readonlyValue, { color: c.text }]}>{user?.name ?? "-"}</Text>
              </View>
              <View style={s.readonlyRow}>
                <Text style={[s.fieldLabel, { color: c.textSecondary }]}>Email</Text>
                <View style={s.emailRow}>
                  <Text style={[s.readonlyValue, { color: c.text, flex: 1 }]}>
                    {user?.email ?? "-"}
                  </Text>
                  {user?.emailVerified ? (
                    <View style={[s.verifiedBadge, { backgroundColor: c.primarySubtle }]}>
                      <IconSymbol name="checkmark.seal.fill" size={12} color={c.primary} />
                      <Text style={[s.verifiedText, { color: c.primary }]}>Verified</Text>
                    </View>
                  ) : (
                    <View style={[s.verifiedBadge, { backgroundColor: `${c.warning}20` }]}>
                      <IconSymbol
                        name="exclamationmark.triangle.fill"
                        size={12}
                        color={c.warning}
                      />
                      <Text style={[s.verifiedText, { color: c.warning }]}>Unverified</Text>
                    </View>
                  )}
                </View>
                {!user?.emailVerified && (
                  <Pressable
                    style={[
                      s.resendBtn,
                      {
                        borderColor: resendCooldown > 0 ? c.border : c.primary,
                        opacity: resendCooldown > 0 ? 0.5 : 1,
                      },
                    ]}
                    onPress={handleResendVerification}
                    disabled={resendCooldown > 0 || resending}
                  >
                    {resending ? (
                      <ActivityIndicator size="small" color={c.primary} />
                    ) : (
                      <Text style={[s.resendBtnText, { color: c.primary }]}>
                        {resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : "Resend Verification Email"}
                      </Text>
                    )}
                  </Pressable>
                )}
              </View>
              <View style={[s.readonlyRow, { borderBottomWidth: 0 }]}>
                <Text style={[s.fieldLabel, { color: c.textSecondary }]}>Role</Text>
                <Text style={[s.readonlyValue, { color: c.text, textTransform: "capitalize" }]}>
                  {user?.role?.replace("_", " ") ?? "-"}
                </Text>
              </View>
            </>
          )}
        </SettingsListSection>

        {/* Phone Number */}
        <SettingsListSection
          title="Phone Number"
          right={
            !editingPhone ? (
              <Pressable style={s.editBtn} onPress={() => setEditingPhone(true)} hitSlop={8}>
                <IconSymbol name="square.and.pencil" size={16} color={c.primary} />
                <Text style={[s.editBtnLabel, { color: c.primary }]}>
                  {user?.phoneNumber ? "Edit" : "Add"}
                </Text>
              </Pressable>
            ) : undefined
          }
        >
          {editingPhone ? (
            <>
              <View style={s.fieldRow}>
                <Text style={[s.fieldLabel, { color: c.textSecondary }]}>Phone</Text>
                <PhoneInput
                  value={phoneDigits}
                  onChangeText={(_formatted, digits) => {
                    setPhoneDigits(digits);
                    if (otpSent) {
                      setOtpSent(false);
                      setOtpCode("");
                    }
                  }}
                  surface="default"
                  editable={!otpSent}
                />
              </View>
              {otpSent && (
                <View style={s.fieldRow}>
                  <Text style={[s.fieldLabel, { color: c.textSecondary }]}>Verification Code</Text>
                  <TextInput
                    style={[
                      s.fieldInput,
                      { color: c.text, borderColor: c.border, backgroundColor: c.bg },
                    ]}
                    value={otpCode}
                    onChangeText={(text) => setOtpCode(text.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={c.textSecondary}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                </View>
              )}
              <View style={s.editActions}>
                <Pressable
                  style={[s.cancelBtn, { borderColor: c.border }]}
                  onPress={handleCancelPhone}
                >
                  <Text style={[s.cancelBtnText, { color: c.text }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[
                    s.actionBtn,
                    {
                      backgroundColor: c.primary,
                      opacity: phoneDigits.length === 10 ? 1 : 0.5,
                    },
                  ]}
                  onPress={otpSent ? handleVerifyPhone : handleSendPhoneOtp}
                  disabled={
                    phoneDigits.length !== 10 ||
                    savingPhone ||
                    verifying ||
                    (otpSent && otpCode.length !== 6)
                  }
                >
                  {savingPhone || verifying ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={s.actionBtnText}>{otpSent ? "Verify" : "Send Code"}</Text>
                  )}
                </Pressable>
              </View>
            </>
          ) : (
            <View style={[s.readonlyRow, { borderBottomWidth: 0 }]}>
              <Text style={[s.fieldLabel, { color: c.textSecondary }]}>Phone</Text>
              {user?.phoneNumber ? (
                <View style={s.emailRow}>
                  <Text style={[s.readonlyValue, { color: c.text, flex: 1 }]}>
                    {user.phoneNumber}
                  </Text>
                  {user.phoneNumberVerified ? (
                    <View style={[s.verifiedBadge, { backgroundColor: c.primarySubtle }]}>
                      <IconSymbol name="checkmark.seal.fill" size={12} color={c.primary} />
                      <Text style={[s.verifiedText, { color: c.primary }]}>Verified</Text>
                    </View>
                  ) : (
                    <View style={[s.verifiedBadge, { backgroundColor: `${c.warning}20` }]}>
                      <IconSymbol
                        name="exclamationmark.triangle.fill"
                        size={12}
                        color={c.warning}
                      />
                      <Text style={[s.verifiedText, { color: c.warning }]}>Unverified</Text>
                    </View>
                  )}
                </View>
              ) : (
                <Text style={[s.readonlyValue, { color: c.muted }]}>Not set</Text>
              )}
            </View>
          )}
        </SettingsListSection>

        {/* Preferences */}
        <SettingsListSection
          title="Preferences"
          right={
            !editingPreferences ? (
              <Pressable style={s.editBtn} onPress={() => setEditingPreferences(true)} hitSlop={8}>
                <IconSymbol name="square.and.pencil" size={16} color={c.primary} />
                <Text style={[s.editBtnLabel, { color: c.primary }]}>Edit</Text>
              </Pressable>
            ) : undefined
          }
        >
          {editingPreferences ? (
            <>
              <View style={s.fieldRow}>
                <Text style={[s.fieldLabel, { color: c.textSecondary }]}>Job Title</Text>
                <TextInput
                  style={[
                    s.fieldInput,
                    { color: c.text, borderColor: c.border, backgroundColor: c.bg },
                  ]}
                  value={jobTitle}
                  onChangeText={setJobTitle}
                  placeholder="e.g. Manager"
                  placeholderTextColor={c.textSecondary}
                  autoCapitalize="words"
                />
              </View>
              <View style={s.editActions}>
                <Pressable
                  style={[s.cancelBtn, { borderColor: c.border }]}
                  onPress={handleCancelPreferences}
                >
                  <Text style={[s.cancelBtnText, { color: c.text }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[
                    s.actionBtn,
                    { backgroundColor: c.primary, opacity: hasPreferencesChanges ? 1 : 0.5 },
                  ]}
                  onPress={handleSavePreferences}
                  disabled={savingPreferences || !hasPreferencesChanges}
                >
                  {savingPreferences ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={s.actionBtnText}>Save</Text>
                  )}
                </Pressable>
              </View>
            </>
          ) : (
            <View style={[s.readonlyRow, { borderBottomWidth: 0 }]}>
              <Text style={[s.fieldLabel, { color: c.textSecondary }]}>Job Title</Text>
              <Text style={[s.readonlyValue, { color: currentJobTitle ? c.text : c.muted }]}>
                {currentJobTitle || "Not set"}
              </Text>
            </View>
          )}
        </SettingsListSection>
      </ScrollView>
    </KeyboardView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 48,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  fieldRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    gap: spacing.sm,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  fieldInput: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editBtnLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  editActions: {
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
    fontSize: 15,
    fontFamily: fonts.medium,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontFamily: fonts.semibold,
  },
  hint: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  readonlyRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    gap: 4,
  },
  readonlyValue: {
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  verifiedText: {
    fontSize: 11,
    fontFamily: fonts.semibold,
  },
  resendBtn: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  resendBtnText: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  toneGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  toneOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  toneLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
});
