import { usePathname, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { OrgSelector } from "@/components/core/org-selector";
import { NAV_ITEMS } from "@/components/core/sidebar-nav-items";
import { AppLogo } from "@/components/ui/app-logo";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import { usePermission } from "@/hooks/use-permission";
import { useAuth } from "@/providers/auth-provider";
import {
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
  useSidebar,
} from "@/providers/sidebar-provider";
import { fonts, radius, spacing, useTheme } from "@/styles";

export function WebSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { can } = usePermission();
  const { colors: c } = useTheme();
  const { avatarUrl } = useAvatarUrl();
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const { isCollapsed, toggleCollapsed } = useSidebar();

  const handleNavPress = useCallback(
    (route: (typeof NAV_ITEMS)[number]["route"]) => {
      router.push(route);
      onNavigate?.();
    },
    [router, onNavigate],
  );

  const sidebarWidth = isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <View
      style={[
        s.container,
        {
          backgroundColor: c.bg,
          borderRightColor: c.border,
          width: sidebarWidth,
          // @ts-expect-error -- web CSS transition
          transition: "width 200ms ease",
        },
      ]}
    >
      {/* Header: Logo + Org Switcher */}
      <View style={[s.headerRow, isCollapsed && s.headerRowCollapsed]}>
        <AppLogo size={28} testID="web-sidebar-logo" />
        {!isCollapsed && (
          <View style={s.flex1}>
            <OrgSelector onNavigate={onNavigate} />
          </View>
        )}
      </View>

      {/* Navigation items */}
      <ScrollView style={s.navSection}>
        {NAV_ITEMS.filter((item) => !item.requires || can(item.requires, "read")).map((item) => {
          const isActive = pathname.includes(item.name);

          return (
            <Pressable
              key={item.name}
              style={[
                s.navItem,
                isCollapsed && s.navItemCollapsed,
                isActive && { backgroundColor: c.primarySubtle },
              ]}
              onPress={() => handleNavPress(item.route)}
              testID={`nav-${item.name}`}
              // @ts-expect-error -- web title attribute for tooltip
              title={isCollapsed ? item.label : undefined}
            >
              <IconSymbol
                name={item.icon}
                size={22}
                color={isActive ? c.primary : c.textSecondary}
              />
              {!isCollapsed && (
                <Text style={[s.navLabel, { color: isActive ? c.primary : c.text }]}>
                  {item.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Bottom bar: User + Collapse toggle */}
      <View style={[s.bottomBar, { borderTopColor: c.border }]}>
        {isCollapsed ? (
          <View style={s.bottomColumnCollapsed}>
            <Pressable
              style={[s.avatarButton, { backgroundColor: c.primaryMuted }]}
              onPress={() => {
                onNavigate?.();
                router.push("/(app)/settings");
              }}
              // @ts-expect-error -- web title
              title={user?.name ?? "Settings"}
            >
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={[s.avatarSmImage, !avatarLoaded && s.hidden]}
                  onLoad={() => setAvatarLoaded(true)}
                  onError={() => setAvatarLoaded(false)}
                />
              ) : null}
              {!avatarLoaded ? (
                <Text style={[s.avatarSmText, { color: c.text }]}>
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </Text>
              ) : null}
            </Pressable>
            <Pressable
              style={[s.collapseButton, { backgroundColor: c.surface }]}
              onPress={toggleCollapsed}
              // @ts-expect-error -- web title
              title="Expand sidebar"
            >
              <IconSymbol name="chevron.right" size={16} color={c.textSecondary} />
            </Pressable>
          </View>
        ) : (
          <View style={s.bottomRow}>
            <Pressable
              style={[s.userChip, { borderColor: c.border, backgroundColor: c.surface }]}
              onPress={() => {
                onNavigate?.();
                router.push("/(app)/settings");
              }}
            >
              <View style={[s.avatarSm, { backgroundColor: c.primaryMuted }]}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={[s.avatarSmImage, !avatarLoaded && s.hidden]}
                    onLoad={() => setAvatarLoaded(true)}
                    onError={() => setAvatarLoaded(false)}
                  />
                ) : null}
                {!avatarLoaded ? (
                  <Text style={[s.avatarSmText, { color: c.text }]}>
                    {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </Text>
                ) : null}
              </View>
              <Text style={[s.userName, { color: c.text }]} numberOfLines={1}>
                {user?.name ?? "User"}
              </Text>
            </Pressable>
            <Pressable
              style={[s.collapseButton, { backgroundColor: c.surface }]}
              onPress={toggleCollapsed}
              // @ts-expect-error -- web title
              title="Collapse sidebar"
            >
              <IconSymbol name="chevron.left" size={16} color={c.textSecondary} />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    borderRightWidth: StyleSheet.hairlineWidth,
    height: "100%",
    overflow: "hidden",
  },
  flex1: {
    flex: 1,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerRowCollapsed: {
    justifyContent: "center",
    paddingHorizontal: 0,
  },

  // Navigation
  navSection: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.lg,
    marginBottom: 2,
  },
  navItemCollapsed: {
    justifyContent: "center",
    paddingHorizontal: 0,
  },
  navLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  bottomColumnCollapsed: {
    alignItems: "center",
    gap: spacing.sm,
  },
  userChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  collapseButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarSm: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSmImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    borderRadius: radius.full,
  },
  hidden: {
    opacity: 0,
  },
  avatarSmText: {
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  userName: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.medium,
  },
});
