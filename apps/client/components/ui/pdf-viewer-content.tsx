import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { useTheme } from "@/styles";

interface PdfViewerContentProps {
  url: string;
  title?: string;
}

export function PdfViewerContent({ url }: PdfViewerContentProps) {
  const { colors: c, isDark } = useTheme();

  return (
    <View style={s.container}>
      <WebView
        source={{ uri: url }}
        style={[s.webview, { backgroundColor: isDark ? c.bg : "#fff" }]}
        startInLoadingState
        renderLoading={() => (
          <View style={s.loadingOverlay}>
            <ActivityIndicator size="large" color={c.primary} />
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
