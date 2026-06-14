import { useRouter } from "expo-router";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PdfViewerContent } from "@/components/ui/pdf-viewer-content";
import { fonts, useTheme } from "@/styles";

interface PdfViewerScreenProps {
  title: string;
  subtitle?: string;
  url: string | null;
  isLoading: boolean;
  emptyMessage?: string;
}

export function PdfViewerScreen({
  title,
  subtitle = "PDF",
  url,
  isLoading,
  emptyMessage = "PDF not available.",
}: PdfViewerScreenProps) {
  const router = useRouter();
  const { colors: c } = useTheme();

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: c.bg }]} edges={["top", "bottom"]}>
      <View style={[s.header, { borderBottomColor: c.border, backgroundColor: c.bg }]}>
        <Pressable
          onPress={() => router.back()}
          style={[s.iconButton, { backgroundColor: c.primaryMuted }]}
          testID="pdf-viewer-back"
        >
          <IconSymbol name="chevron.left" size={18} color={c.primary} />
        </Pressable>
        <View style={s.headerTextWrap}>
          <Text style={[s.title, { color: c.text }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[s.subtitle, { color: c.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        {url ? (
          <Pressable
            onPress={() => Linking.openURL(url)}
            style={[s.iconButton, { backgroundColor: c.primaryMuted }]}
            testID="pdf-viewer-open-external"
          >
            <IconSymbol name="arrow.up.right.square" size={18} color={c.primary} />
          </Pressable>
        ) : (
          <View style={s.iconSpacer} />
        )}
      </View>

      {isLoading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      ) : url ? (
        <PdfViewerContent url={url} title={title} />
      ) : (
        <View style={s.centered}>
          <IconSymbol name="doc.text" size={28} color={c.muted} />
          <Text style={[s.emptyTitle, { color: c.text }]}>Not available</Text>
          <Text style={[s.emptyBody, { color: c.textSecondary }]}>{emptyMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconSpacer: {
    width: 40,
    height: 40,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.semibold,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fonts.semibold,
  },
  emptyBody: {
    fontSize: 14,
    fontFamily: fonts.regular,
    textAlign: "center",
  },
});
