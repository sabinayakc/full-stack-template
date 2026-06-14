import { Slot, usePathname } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { WebContentHeader } from "@/components/core/web-content-header";
import { WebSidebar } from "@/components/core/web-sidebar";
import { useWebLayout } from "@/hooks/use-web-layout";
import { useSidebar } from "@/providers/sidebar-provider";
import { useTheme } from "@/styles";

/** Routes that render their own header — global content header is hidden for these. */
const ROUTES_WITHOUT_GLOBAL_HEADER = ["/settings", "/notifications", "/onboarding"];

export function WebAppLayout() {
  const { colors: c } = useTheme();
  const { isMobile } = useWebLayout();
  const { sidebarWidth, isMobileOpen, closeMobile } = useSidebar();
  const pathname = usePathname();
  const hideGlobalHeader = ROUTES_WITHOUT_GLOBAL_HEADER.some((r) => pathname.startsWith(r));

  return (
    <View style={[s.root, { backgroundColor: c.bg }]}>
      {/* Static sidebar (desktop/tablet) */}
      {!isMobile && (
        <View style={[s.sidebarColumn, { width: sidebarWidth }]}>
          <WebSidebar />
        </View>
      )}

      {/* Content area */}
      <View style={s.contentColumn}>
        {!hideGlobalHeader && <WebContentHeader />}
        <View style={s.slotContainer}>
          <Slot />
        </View>
      </View>

      {/* Mobile overlay sidebar */}
      {isMobile && isMobileOpen && (
        <View style={s.overlay}>
          <Pressable style={s.backdrop} onPress={closeMobile} />
          <View
            style={[
              s.overlayPanel,
              {
                backgroundColor: c.bg,
                boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
              },
            ]}
          >
            <WebSidebar onNavigate={closeMobile} />
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
  },
  sidebarColumn: {
    height: "100%",
    // @ts-expect-error -- web CSS transition
    transition: "width 200ms ease",
    overflow: "hidden",
  },
  contentColumn: {
    flex: 1,
    height: "100%",
    overflow: "hidden",
  },
  slotContainer: {
    flex: 1,
    overflow: "auto" as "scroll",
  },

  // Mobile overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  overlayPanel: {
    width: 280,
    height: "100%",
    zIndex: 101,
  },
});
