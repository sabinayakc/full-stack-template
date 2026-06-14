import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { confirm } from "@/components/ui/confirm-dialog";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { APP_NAME } from "@/constants/app";
import { authClient, useSession } from "@/lib/auth";
import { formatTimeAgo } from "@/lib/formatters";
import { useToast } from "@/providers/toast-provider";
import { fonts, radius, spacing, useTheme } from "@/styles";

interface SessionInfo {
  id: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
}

function parseDevice(userAgent?: string | null): { name: string; icon: string } {
  if (!userAgent) return { name: "Unknown Device", icon: "desktopcomputer" };
  const ua = userAgent.toLowerCase();

  const nativeMatch = userAgent.match(
    new RegExp(`${APP_NAME}\\/[\\d.]+ \\((\\w+) [\\d.]+; ([^;]+); (\\w+)\\)`),
  );
  if (nativeMatch) {
    const [, os, model, formFactor] = nativeMatch;
    const icon = formFactor === "Mobile" ? "iphone" : "ipad";
    return { name: `${model} (${os})`, icon };
  }

  if (ua.includes("iphone")) return { name: "iPhone", icon: "iphone" };
  if (ua.includes("ipad")) return { name: "iPad", icon: "ipad" };
  if (ua.includes("android") && ua.includes("mobile"))
    return { name: "Android Phone", icon: "iphone" };
  if (ua.includes("android")) return { name: "Android Tablet", icon: "ipad" };
  if (ua.includes("macintosh") || ua.includes("mac os"))
    return { name: "Mac", icon: "laptopcomputer" };
  if (ua.includes("windows")) return { name: "Windows PC", icon: "desktopcomputer" };
  if (ua.includes("linux")) return { name: "Linux", icon: "desktopcomputer" };

  return { name: "Unknown Device", icon: "desktopcomputer" };
}

function parseBrowser(userAgent?: string | null): string {
  if (!userAgent) return "Unknown Browser";
  const ua = userAgent;

  if (ua.includes(`${APP_NAME}/`)) return `${APP_NAME} App`;
  if (ua.includes("Expo")) return `${APP_NAME} App`;
  if (ua.includes("CriOS")) return "Chrome";
  if (ua.includes("FxiOS")) return "Firefox";
  if (ua.includes("EdgiOS") || ua.includes("Edg/")) return "Edge";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";

  return "Browser";
}

export default function SessionsScreen() {
  const { colors: c } = useTheme();
  const toast = useToast();
  const { data: currentSession } = useSession();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const currentToken = currentSession?.session?.token;

  const fetchSessions = useCallback(async () => {
    try {
      const { data, error } = await authClient.listSessions();
      if (error) {
        toast.error("Failed to load sessions.");
        return;
      }
      const sorted = [...(data ?? [])].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      setSessions(sorted);
    } catch {
      toast.error("Failed to load sessions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevoke = async (token: string) => {
    const confirmed = await confirm({
      title: "Revoke Session",
      message: "This will sign out that device. Continue?",
      confirmLabel: "Revoke",
      variant: "danger",
    });
    if (!confirmed) return;

    setRevokingToken(token);
    try {
      const { error } = await authClient.revokeSession({ token });
      if (error) {
        toast.error("Failed to revoke session.");
      } else {
        setSessions((prev) => prev.filter((s) => s.token !== token));
        toast.success("Session revoked.");
      }
    } finally {
      setRevokingToken(null);
    }
  };

  const handleRevokeAll = async () => {
    const confirmed = await confirm({
      title: "Revoke All Other Sessions",
      message: "This will sign out all other devices. Continue?",
      confirmLabel: "Revoke All",
      variant: "danger",
    });
    if (!confirmed) return;

    setRevokingAll(true);
    try {
      const { error } = await authClient.revokeOtherSessions();
      if (error) {
        toast.error("Failed to revoke sessions.");
      } else {
        setSessions((prev) => prev.filter((s) => s.token === currentToken));
        toast.success("All other sessions revoked.");
      }
    } finally {
      setRevokingAll(false);
    }
  };

  const otherSessions = sessions.filter((s) => s.token !== currentToken);

  if (loading) {
    return (
      <View style={[s.centered, { backgroundColor: c.bg }]}>
        <ActivityIndicator size="large" color={c.primary} testID="sessions-loading" />
      </View>
    );
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={[s.container, { backgroundColor: c.bg }]}
      contentContainerStyle={s.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <Text style={[s.sectionTitle, { color: c.textSecondary }]}>CURRENT SESSION</Text>
      {sessions
        .filter((session) => session.token === currentToken)
        .map((session) => {
          const device = parseDevice(session.userAgent);
          const browser = parseBrowser(session.userAgent);
          return (
            <View
              key={session.id}
              testID="current-session"
              style={[s.card, { backgroundColor: c.bgSecondary, borderColor: c.border }]}
            >
              <View style={s.cardRow}>
                <View style={[s.iconBox, { backgroundColor: `${c.success}1A` }]}>
                  <IconSymbol name={device.icon} size={20} color={c.success} />
                </View>
                <View style={s.cardContent}>
                  <View style={s.nameRow}>
                    <Text style={[s.deviceName, { color: c.text }]}>{device.name}</Text>
                    <View style={[s.badge, { backgroundColor: `${c.success}1A` }]}>
                      <Text style={[s.badgeText, { color: c.success }]}>Current</Text>
                    </View>
                  </View>
                  <Text style={[s.detail, { color: c.textSecondary }]}>{browser}</Text>
                  {session.ipAddress ? (
                    <Text style={[s.detail, { color: c.textSecondary }]}>
                      IP: {session.ipAddress}
                    </Text>
                  ) : null}
                  <Text style={[s.detail, { color: c.textSecondary }]}>
                    Active {formatTimeAgo(session.updatedAt)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

      {otherSessions.length > 0 ? (
        <>
          <View style={s.otherHeader}>
            <Text style={[s.sectionTitle, { color: c.textSecondary }]}>OTHER SESSIONS</Text>
            <Pressable
              testID="revoke-all-btn"
              onPress={handleRevokeAll}
              disabled={revokingAll}
              style={({ pressed }) => [s.revokeAllBtn, pressed && { opacity: 0.7 }]}
            >
              {revokingAll ? (
                <ActivityIndicator size="small" color={c.danger} />
              ) : (
                <Text style={[s.revokeAllText, { color: c.danger }]}>Revoke All</Text>
              )}
            </Pressable>
          </View>
          {otherSessions.map((session) => {
            const device = parseDevice(session.userAgent);
            const browser = parseBrowser(session.userAgent);
            const isRevoking = revokingToken === session.token;
            return (
              <View
                key={session.id}
                testID="other-session"
                style={[s.card, { backgroundColor: c.bgSecondary, borderColor: c.border }]}
              >
                <View style={s.cardRow}>
                  <View style={[s.iconBox, { backgroundColor: `${c.textSecondary}1A` }]}>
                    <IconSymbol name={device.icon} size={20} color={c.textSecondary} />
                  </View>
                  <View style={s.cardContent}>
                    <Text style={[s.deviceName, { color: c.text }]}>{device.name}</Text>
                    <Text style={[s.detail, { color: c.textSecondary }]}>{browser}</Text>
                    {session.ipAddress ? (
                      <Text style={[s.detail, { color: c.textSecondary }]}>
                        IP: {session.ipAddress}
                      </Text>
                    ) : null}
                    <Text style={[s.detail, { color: c.textSecondary }]}>
                      Active {formatTimeAgo(session.updatedAt)}
                    </Text>
                  </View>
                  <Pressable
                    testID={`revoke-btn-${session.id}`}
                    onPress={() => handleRevoke(session.token)}
                    disabled={isRevoking}
                    style={({ pressed }) => [s.revokeBtn, pressed && { opacity: 0.7 }]}
                  >
                    {isRevoking ? (
                      <ActivityIndicator size="small" color={c.danger} />
                    ) : (
                      <Text style={[s.revokeBtnText, { color: c.danger }]}>Revoke</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            );
          })}
        </>
      ) : null}

      <View style={s.infoBox}>
        <Text style={[s.infoText, { color: c.textSecondary }]}>
          These are the devices currently signed in to your account. Revoke any session you don't
          recognize.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 48,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.sm,
  },
  otherHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.sm,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  deviceName: {
    fontSize: 15,
    fontFamily: fonts.semibold,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: fonts.semibold,
  },
  detail: {
    fontSize: 13,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  revokeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "center",
  },
  revokeBtnText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
  },
  revokeAllBtn: {
    paddingVertical: 4,
  },
  revokeAllText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
  },
  infoBox: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  infoText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
});
