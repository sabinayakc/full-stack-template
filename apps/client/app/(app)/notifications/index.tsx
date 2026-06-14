import type { Notification, NotificationMetadata, NotificationType } from "@repo/shared";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useMyNotifications,
  useUnreadCount,
} from "@/hooks/use-notification-api";
import { formatRelativeDate, getDateGroup } from "@/lib/formatters";
import { fonts, useTheme } from "@/styles";

const TYPE_FILTERS = ["all", "general"] as const;

const TYPE_LABELS: Record<string, string> = {
  all: "All",
  general: "General",
};

const TYPE_ICONS: Record<NotificationType, string> = {
  general: "bell.fill",
};

type SectionItem =
  | { type: "header"; label: string; key: string }
  | { type: "notification"; data: Notification; key: string };

export default function NotificationsScreen() {
  const { colors: c, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: unread } = useUnreadCount();
  const unreadCount = unread?.count ?? 0;

  const listFilters = useMemo(
    () => (typeFilter !== "all" ? { type: typeFilter } : undefined),
    [typeFilter],
  );
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch, isRefetching } =
    useMyNotifications(listFilters);
  const [userPulled, setUserPulled] = useState(false);

  useEffect(() => {
    if (!isRefetching) setUserPulled(false);
  }, [isRefetching]);

  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];

  const sections = useMemo(() => {
    const items: SectionItem[] = [];
    let lastGroup = "";
    for (const n of notifications) {
      const group = getDateGroup(n.createdAt);
      if (group !== lastGroup) {
        items.push({ type: "header", label: group, key: `header-${group}` });
        lastGroup = group;
      }
      items.push({ type: "notification", data: n, key: n.id });
    }
    return items;
  }, [notifications]);

  const handlePress = useCallback(
    (id: string, status: string, metadata: NotificationMetadata | null) => {
      if (status !== "read") {
        markRead.mutate(id);
      }

      if (metadata?.href) {
        router.replace(metadata.href as never);
      }
    },
    [markRead, router],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: SectionItem }) => {
      if (item.type === "header") {
        return <Text style={[s.sectionHeader, { color: c.textSecondary }]}>{item.label}</Text>;
      }

      const n = item.data;
      const isUnread = n.status !== "read";
      const iconName = TYPE_ICONS[n.type as NotificationType] ?? "bell.fill";

      return (
        <Pressable
          style={[
            s.notifCard,
            {
              borderColor: isUnread ? `${c.primary}4D` : c.border,
              backgroundColor: isUnread ? `${c.primary}0D` : c.bgSecondary,
            },
          ]}
          onPress={() => handlePress(n.id, n.status, n.metadata)}
          testID={`notification-${n.id}`}
        >
          <View style={s.notifRow}>
            <View style={[s.notifIcon, { backgroundColor: isUnread ? c.primaryMuted : c.bg }]}>
              <IconSymbol
                name={iconName as string}
                size={18}
                color={isUnread ? c.primary : c.textSecondary}
              />
            </View>
            <View style={s.flex1}>
              {n.subject && (
                <Text
                  style={[s.notifSubject, { color: isUnread ? c.text : c.textSecondary }]}
                  numberOfLines={1}
                >
                  {n.subject}
                </Text>
              )}
              <Text
                style={[
                  s.notifBody,
                  {
                    color: isUnread ? c.text : c.textSecondary,
                    marginTop: n.subject ? 2 : 0,
                  },
                ]}
                numberOfLines={2}
              >
                {n.body}
              </Text>
              <View style={s.notifMeta}>
                <Text style={[s.notifTypeLabel, { color: c.textSecondary }]}>
                  {TYPE_LABELS[n.type] ?? n.type}
                </Text>
                <Text style={[s.notifMetaDot, { color: c.textSecondary }]}>{"\u00B7"}</Text>
                <Text style={[s.notifDate, { color: c.textSecondary }]}>
                  {formatRelativeDate(n.createdAt)}
                </Text>
                {isUnread && <View style={[s.unreadDot, { backgroundColor: c.primary }]} />}
              </View>
            </View>
          </View>
        </Pressable>
      );
    },
    [c, handlePress],
  );

  const pillBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";

  return (
    <View style={[s.flex1, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      {/* Modal header */}
      <View style={[s.modalHeader, { borderBottomColor: c.border }]}>
        <View style={s.headerActions}>
          {unreadCount > 0 && (
            <Pressable
              style={[s.headerBtn, { backgroundColor: pillBg }]}
              onPress={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              hitSlop={4}
              testID="notifications-mark-all-read"
            >
              {markAllRead.isPending ? (
                <ActivityIndicator size={14} />
              ) : (
                <IconSymbol name="checkmark.circle" size={18} color={c.primary} />
              )}
            </Pressable>
          )}
          <Pressable
            style={[s.headerBtn, { backgroundColor: pillBg }]}
            onPress={() => router.push("/(app)/settings/notifications")}
            hitSlop={4}
            testID="notifications-settings"
          >
            <IconSymbol name="gearshape" size={18} color={c.textSecondary} />
          </Pressable>
        </View>

        <Text style={[s.modalTitle, { color: c.text }]}>Notifications</Text>

        <Pressable
          style={[s.headerBtn, { backgroundColor: pillBg }]}
          onPress={() => router.back()}
          hitSlop={8}
          testID="notifications-close"
        >
          <IconSymbol name="xmark" size={16} color={c.textSecondary} />
        </Pressable>
      </View>

      {/* Type filter pills */}
      <FilterBar
        filters={TYPE_FILTERS}
        activeFilter={typeFilter}
        onFilterChange={setTypeFilter}
        renderLabel={(f) => TYPE_LABELS[f] ?? f}
      />

      {/* Notification list */}
      {isLoading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="bell.slash.fill"
          title={
            typeFilter !== "all"
              ? `No ${TYPE_LABELS[typeFilter]?.toLowerCase() ?? typeFilter} notifications`
              : "No notifications yet"
          }
          subtitle="Notifications from jobs, estimates, and schedules will appear here."
        />
      ) : (
        <FlatList
          data={sections}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          style={s.listScroll}
          contentContainerStyle={s.listContent}
          refreshControl={
            <RefreshControl
              refreshing={userPulled && isRefetching}
              onRefresh={() => {
                setUserPulled(true);
                refetch();
              }}
              tintColor={c.textSecondary}
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={s.loadingMore}>
                <ActivityIndicator size="small" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: fonts.semibold,
  },
  sectionHeader: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 80,
  },
  notifCard: {
    marginBottom: 8,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  notifIcon: {
    marginTop: 2,
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
  },
  notifSubject: {
    fontSize: 14,
    fontFamily: fonts.semibold,
  },
  notifBody: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.regular,
  },
  notifMeta: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  notifTypeLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: fonts.medium,
  },
  notifMetaDot: {
    fontSize: 10,
    fontFamily: fonts.regular,
  },
  notifDate: {
    fontSize: 10,
    fontFamily: fonts.regular,
  },
  unreadDot: {
    marginLeft: "auto",
    height: 8,
    width: 8,
    borderRadius: 9999,
  },
  loadingMore: {
    alignItems: "center",
    paddingVertical: 16,
  },
});
