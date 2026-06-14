import { Drawer } from "expo-router/drawer";
import { Platform, Pressable, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NotificationBell } from "@/components/core/notification-bell";
import { SidebarContent } from "@/components/core/sidebar-content";
import { WebAppLayout } from "@/components/core/web-app-layout";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { APP_NAME } from "@/constants/app";
import { haptic } from "@/lib/haptics";
import { useAuth } from "@/providers/auth-provider";
import { SidebarProvider } from "@/providers/sidebar-provider";
import { useTheme } from "@/styles";

const isWeb = Platform.OS === "web";

export default function AppLayout() {
  const { isAuthenticated, activeOrganization } = useAuth();
  const { colors: c, isDark } = useTheme();

  if (!isAuthenticated || !activeOrganization) {
    return <LoadingScreen dark={isDark} showSpinner spinnerColor={c.primary} />;
  }

  if (isWeb) {
    return (
      <SidebarProvider>
        <View style={{ flex: 1 }}>
          <WebAppLayout />
        </View>
      </SidebarProvider>
    );
  }

  return <NativeDrawerLayout />;
}

function NativeDrawerLayout() {
  const { colors: c } = useTheme();
  const { width } = useWindowDimensions();
  const drawerWidth = width * 0.75;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <SidebarContent {...props} />}
        screenOptions={({ navigation }) => ({
          drawerType: "front",
          drawerStyle: {
            width: drawerWidth,
            backgroundColor: c.bg,
          },
          headerStyle: {
            backgroundColor: c.bg,
          },
          headerTintColor: c.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable
              style={{ marginLeft: 16 }}
              onPress={() => {
                haptic.light();
                navigation.toggleDrawer();
              }}
              testID="drawer-toggle"
            >
              <IconSymbol name="line.horizontal.3" size={24} color={c.textSecondary} />
            </Pressable>
          ),
          headerRight: () => <NotificationBell />,
        })}
      >
        <Drawer.Screen name="index" options={{ title: APP_NAME }} />
        <Drawer.Screen
          name="notifications/index"
          options={{
            title: "Notifications",
            headerShown: false,
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: "Settings",
            headerShown: false,
            drawerItemStyle: { display: "none" },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
