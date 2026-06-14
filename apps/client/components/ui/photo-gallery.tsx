import { Image } from "expo-image";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { DocViewer } from "@/components/ui/doc-viewer";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { OperationOverlay } from "@/components/ui/operation-overlay";
import { fonts, radius, useTheme } from "@/styles";

export interface GalleryItem {
  id: string;
  url: string;
  name: string;
  mimeType?: string | null;
  badge?: string | null;
}

interface PhotoGalleryProps {
  items: GalleryItem[];
  emptyText?: string;
  onDelete?: (id: string, name: string) => void | Promise<void>;
  /** When true, uses "contain" fit for images (useful for diagrams). Default "cover". */
  containFit?: boolean;
}

const CARD_WIDTH = 140;
const THUMB_HEIGHT = 105;

export function PhotoGallery({
  items,
  emptyText = "No items yet.",
  onDelete,
  containFit,
}: PhotoGalleryProps) {
  const { colors: c } = useTheme();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{
    url: string;
    name: string;
    mimeType?: string | null;
  } | null>(null);

  const wrappedDelete = useCallback(
    async (id: string, name: string) => {
      if (!onDelete) return;
      setBusyId(id);
      try {
        await onDelete(id, name);
      } finally {
        setBusyId(null);
      }
    },
    [onDelete],
  );

  if (items.length === 0) {
    return <Text style={[s.emptyText, { color: c.textSecondary }]}>{emptyText}</Text>;
  }

  return (
    <>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={s.listContent}
        renderItem={({ item }) => {
          const isImage = item.mimeType?.startsWith("image/");
          const isBusy = busyId === item.id;

          return (
            <OperationOverlay visible={isBusy}>
              <Pressable
                onPress={() =>
                  setViewer({ url: item.url, name: item.name, mimeType: item.mimeType })
                }
                style={[s.card, { borderColor: c.border, backgroundColor: c.bgSecondary }]}
                disabled={isBusy}
              >
                {isImage ? (
                  <Image
                    source={{ uri: item.url }}
                    style={s.thumb}
                    contentFit={containFit ? "contain" : "cover"}
                    recyclingKey={item.id}
                  />
                ) : (
                  <View style={[s.thumb, s.iconThumb, { backgroundColor: c.bg }]}>
                    <IconSymbol name="doc.text.fill" size={28} color={c.primary} />
                  </View>
                )}

                <View style={s.cardFooter}>
                  <View style={s.cardMeta}>
                    {item.badge ? (
                      <View style={[s.badge, { backgroundColor: c.primaryMuted }]}>
                        <Text style={[s.badgeText, { color: c.primary }]}>{item.badge}</Text>
                      </View>
                    ) : null}
                    <Text style={[s.cardName, { color: c.text }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                  {onDelete ? (
                    <Pressable
                      onPress={() => wrappedDelete(item.id, item.name)}
                      hitSlop={6}
                      style={s.deleteBtn}
                      disabled={isBusy}
                    >
                      <IconSymbol name="trash.fill" size={13} color={c.danger} />
                    </Pressable>
                  ) : null}
                </View>
              </Pressable>
            </OperationOverlay>
          );
        }}
      />

      {items.length > 1 ? (
        <View style={s.browseHintRow}>
          <IconSymbol name="chevron.left" size={10} color={c.muted} />
          <Text style={[s.browseHintText, { color: c.muted }]}>Browse</Text>
          <IconSymbol name="chevron.right" size={10} color={c.muted} />
        </View>
      ) : null}

      <DocViewer
        visible={viewer !== null}
        onClose={() => setViewer(null)}
        url={viewer?.url ?? ""}
        name={viewer?.name ?? ""}
        mimeType={viewer?.mimeType}
      />
    </>
  );
}

const s = StyleSheet.create({
  listContent: {
    gap: 10,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  thumb: {
    width: CARD_WIDTH,
    height: THUMB_HEIGHT,
  },
  iconThumb: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  cardMeta: {
    flex: 1,
    gap: 2,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  cardName: {
    fontSize: 11,
    fontFamily: fonts.medium,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  browseHintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
  },
  browseHintText: {
    fontSize: 11,
    fontFamily: fonts.medium,
  },
});
