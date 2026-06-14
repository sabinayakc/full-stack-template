import { usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NotificationBell } from "@/components/core/notification-bell";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { APP_NAME } from "@/constants/app";
import { useWebLayout } from "@/hooks/use-web-layout";
import { useSidebar } from "@/providers/sidebar-provider";
import { fonts, useTheme } from "@/styles";

const ROUTE_TITLES: Record<string, string> = {
  settings: "Settings",
  notifications: "Notifications",
};

function getTitleFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  for (const segment of segments) {
    if (ROUTE_TITLES[segment]) return ROUTE_TITLES[segment];
  }
  return APP_NAME;
}

export function WebContentHeader() {
  const { colors: c } = useTheme();
  const { isMobile } = useWebLayout();
  const { toggleCollapsed, openMobile, isCollapsed } = useSidebar();
  const pathname = usePathname();
  const title = getTitleFromPathname(pathname);

  return (
    <View style={[s.header, { borderBottomColor: c.border }]}>
      <View style={s.left}>
        <Pressable
          style={[s.toggleButton, { backgroundColor: c.surface }]}
          onPress={isMobile ? openMobile : toggleCollapsed}
        >
          <IconSymbol
            name={isMobile || isCollapsed ? "line.horizontal.3" : "sidebar.left"}
            size={20}
            color={c.textSecondary}
          />
        </Pressable>
        <Text style={[s.title, { color: c.text }]}>{title}</Text>
      </View>
      <NotificationBell />
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.semibold,
  },
});
