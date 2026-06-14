import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useUnreadCount } from "@/hooks/use-notification-api";
import { haptic } from "@/lib/haptics";
import { fonts } from "@/styles";

export function NotificationBell() {
  const router = useRouter();
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;

  return (
    <Pressable
      style={s.button}
      onPress={() => {
        haptic.light();
        router.push("/(app)/notifications");
      }}
    >
      <IconSymbol name="bell.fill" size={22} color="#6b7280" />
      {count > 0 && (
        <View style={s.badge}>
          <Text style={s.badgeText}>{count > 99 ? "99+" : count}</Text>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  button: {
    position: "relative",
    marginRight: 16,
    padding: 4,
  },
  badge: {
    position: "absolute",
    right: -4,
    top: -4,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: "#ef4444",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    lineHeight: 12,
    color: "#ffffff",
  },
});
