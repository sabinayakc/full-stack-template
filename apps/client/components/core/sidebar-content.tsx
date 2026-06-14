import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { type Href, usePathname, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { OrgSelector } from "@/components/core/org-selector";
import { NAV_ITEMS } from "@/components/core/sidebar-nav-items";
import { AppLogo } from "@/components/ui/app-logo";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import { usePermission } from "@/hooks/use-permission";
import { haptic } from "@/lib/haptics";
import { useAuth } from "@/providers/auth-provider";
import { fonts, radius, spacing, useTheme } from "@/styles";

export function SidebarContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { colors: c } = useTheme();
  const { can } = usePermission();
  const { avatarUrl } = useAvatarUrl();
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  const handleNavPress = useCallback(
    (route: Href) => {
      haptic.light();
      router.push(route);
      props.navigation.closeDrawer();
    },
    [router, props.navigation],
  );

  return (
    <View style={[s.container, { backgroundColor: c.bg }]}>
      {/* Header: Logo + Org Switcher */}
      <View style={s.headerRow}>
        <AppLogo size={28} testID="sidebar-logo" />
        <View style={s.flex1}>
          <OrgSelector onNavigate={() => props.navigation.closeDrawer()} />
        </View>
      </View>

      {/* Navigation items */}
      <ScrollView style={s.navSection}>
        {NAV_ITEMS.filter((item) => !item.requires || can(item.requires, "read")).map((item) => {
          const isActive = pathname.includes(item.name);

          return (
            <Pressable
              key={item.name}
              style={[s.navItem, isActive && { backgroundColor: c.primarySubtle }]}
              onPress={() => handleNavPress(item.route)}
              testID={`nav-${item.name}`}
            >
              <IconSymbol
                name={item.icon}
                size={22}
                color={isActive ? c.primary : c.textSecondary}
              />
              <Text style={[s.navLabel, { color: isActive ? c.primary : c.text }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Fixed bottom: User profile */}
      <View style={[s.bottomBar, { borderTopColor: c.border }]}>
        <Pressable
          style={[s.userChip, { borderColor: c.border, backgroundColor: c.surface }]}
          onPress={() => {
            haptic.light();
            props.navigation.closeDrawer();
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
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingTop: 56,
    paddingBottom: spacing.md,
  },

  // Navigation
  navSection: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 15,
    fontFamily: fonts.medium,
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  userChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  avatarSm: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSmImage: {
    ...StyleSheet.absoluteFillObject,
    width: 32,
    height: 32,
    borderRadius: radius.full,
  },
  hidden: {
    opacity: 0,
  },
  avatarSmText: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  userName: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.medium,
  },
});
