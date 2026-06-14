import { cacheDirectory, downloadAsync } from "expo-file-system/legacy";
import { Image } from "expo-image";
import * as Sharing from "expo-sharing";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { AppModal } from "@/components/ui/app-modal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { fonts, radius, useTheme } from "@/styles";

type FileCategory = "image" | "pdf" | "unsupported";

function categorize(mimeType: string | null | undefined): FileCategory {
  if (!mimeType) return "unsupported";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  return "unsupported";
}

/** Neutral background for transparent diagrams — visible against both dark and light content. */
const DIAGRAM_BG = "#e0e0e0";

interface DocViewerProps {
  visible: boolean;
  onClose: () => void;
  url: string;
  name: string;
  mimeType?: string | null;
  isDiagram?: boolean;
}

export function DocViewer({ visible, onClose, url, name, mimeType, isDiagram }: DocViewerProps) {
  const { colors: c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const category = categorize(mimeType);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!url || downloading) return;

    setDownloading(true);
    try {
      // Download to a temp file
      const fileUri = `${cacheDirectory}${name}`;
      const { uri } = await downloadAsync(url, fileUri);

      // Open the native share sheet so user can save to Files, camera roll, AirDrop, etc.
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: mimeType ?? undefined,
          dialogTitle: `Save ${name}`,
        });
      } else {
        Alert.alert("Sharing not available", "Unable to save file on this device.");
      }
    } catch {
      Alert.alert("Download Failed", "Could not download the file. Please try again.");
    } finally {
      setDownloading(false);
    }
  }, [url, name, mimeType, downloading]);

  return (
    <AppModal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View
        style={[
          s.container,
          {
            backgroundColor: category === "image" ? (isDiagram ? DIAGRAM_BG : "#000") : c.bg,
          },
        ]}
      >
        {/* Header */}
        <View
          style={[
            s.header,
            {
              paddingTop: insets.top + 8,
              backgroundColor:
                category === "image" ? (isDiagram ? DIAGRAM_BG : "rgba(0,0,0,0.6)") : c.bg,
              borderBottomColor: category === "image" ? "transparent" : c.border,
            },
          ]}
        >
          <View style={s.headerContent}>
            {(() => {
              const headerColor = category === "image" ? (isDiagram ? "#333" : "#fff") : c.text;
              const accentColor =
                category === "image" ? (isDiagram ? c.primary : "#fff") : c.primary;
              return (
                <>
                  <Pressable onPress={onClose} hitSlop={12} style={s.closeBtn}>
                    <IconSymbol name="xmark" size={18} color={headerColor} />
                  </Pressable>
                  <Text style={[s.headerTitle, { color: headerColor }]} numberOfLines={1}>
                    {name}
                  </Text>
                  <Pressable
                    onPress={() => void handleDownload()}
                    hitSlop={12}
                    style={s.downloadBtn}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <ActivityIndicator size="small" color={accentColor} />
                    ) : (
                      <IconSymbol name="square.and.arrow.down" size={22} color={accentColor} />
                    )}
                  </Pressable>
                </>
              );
            })()}
          </View>
        </View>

        {/* Content */}
        <View style={s.content}>
          {category === "image" && (
            <Image
              source={{ uri: url }}
              style={s.image}
              contentFit="contain"
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
            />
          )}

          {category === "pdf" && (
            <WebView
              source={
                Platform.OS === "android"
                  ? {
                      uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`,
                    }
                  : { uri: url }
              }
              style={[s.webview, { backgroundColor: isDark ? c.bg : "#fff" }]}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              startInLoadingState
              scalesPageToFit
              javaScriptEnabled
            />
          )}

          {category === "unsupported" && (
            <View style={s.unsupported}>
              <View style={[s.unsupportedIcon, { backgroundColor: c.primaryMuted }]}>
                <IconSymbol name="doc.fill" size={48} color={c.primary} />
              </View>
              <Text style={[s.unsupportedName, { color: c.text }]} numberOfLines={2}>
                {name}
              </Text>
              {mimeType && (
                <Text style={[s.unsupportedMime, { color: c.textSecondary }]}>{mimeType}</Text>
              )}
              <Text style={[s.unsupportedHint, { color: c.textSecondary }]}>
                Preview not available for this file type.
              </Text>
              <Pressable
                style={[s.downloadLargeBtn, { backgroundColor: c.primary }]}
                onPress={() => void handleDownload()}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <IconSymbol name="square.and.arrow.down" size={18} color="#fff" />
                )}
                <Text style={s.downloadLargeBtnText}>
                  {downloading ? "Saving..." : "Save to Device"}
                </Text>
              </Pressable>
            </View>
          )}

          {loading && category !== "unsupported" && (
            <View style={s.loadingOverlay}>
              <ActivityIndicator
                size="large"
                color={category === "image" ? (isDiagram ? c.primary : "#fff") : c.primary}
              />
            </View>
          )}
        </View>
      </View>
    </AppModal>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(128,128,128,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.semibold,
  },
  downloadBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  unsupported: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  unsupportedIcon: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  unsupportedName: {
    fontSize: 18,
    fontFamily: fonts.semibold,
    textAlign: "center",
  },
  unsupportedMime: {
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  unsupportedHint: {
    fontSize: 14,
    fontFamily: fonts.regular,
    textAlign: "center",
    marginTop: 4,
  },
  downloadLargeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: radius.lg,
    marginTop: 16,
  },
  downloadLargeBtnText: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: "#fff",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
