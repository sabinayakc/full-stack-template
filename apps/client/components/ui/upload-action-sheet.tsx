import { Image } from "expo-image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppModal } from "@/components/ui/app-modal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { PickedFile } from "@/hooks/use-file-picker";
import { useFilePicker } from "@/hooks/use-file-picker";
import { fonts, radius, useTheme } from "@/styles";

const isWeb = Platform.OS === "web";

interface UploadActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (files: PickedFile[], replaceDuplicates: boolean) => void;
  existingDocumentNames?: string[];
  isUploading?: boolean;
  uploadCompleted?: number;
  uploadTotal?: number;
  dismissOnBackdropPress?: boolean;
}

interface ActionOption {
  label: string;
  icon: string;
  action: () => Promise<PickedFile[]>;
}

export function UploadActionSheet({
  visible,
  onClose,
  onSubmit,
  existingDocumentNames,
  isUploading,
  uploadCompleted,
  uploadTotal,
  dismissOnBackdropPress = false,
}: UploadActionSheetProps) {
  const { colors: c } = useTheme();
  const { pickImages, takePhoto, pickDocuments } = useFilePicker();
  const [picking, setPicking] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<PickedFile[]>([]);

  // Clear staged files when the sheet is closed or upload finishes
  const prevVisible = useRef(visible);
  const prevUploading = useRef(isUploading);
  useEffect(() => {
    if (prevVisible.current && !visible) {
      setStagedFiles([]);
    }
    if (prevUploading.current && !isUploading) {
      setStagedFiles([]);
    }
    prevVisible.current = visible;
    prevUploading.current = isUploading;
  }, [visible, isUploading]);

  const existingNamesSet = useMemo(
    () => new Set(existingDocumentNames ?? []),
    [existingDocumentNames],
  );

  const duplicateNames = useMemo(
    () => stagedFiles.filter((f) => existingNamesSet.has(f.name)).map((f) => f.name),
    [stagedFiles, existingNamesSet],
  );

  const hasDuplicates = duplicateNames.length > 0;

  const handlePick = useCallback(async (picker: () => Promise<PickedFile[]>) => {
    setPicking(true);
    try {
      const files = await picker();
      if (files.length > 0) {
        setStagedFiles((prev) => [...prev, ...files]);
      }
    } finally {
      setPicking(false);
    }
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmitReplace = useCallback(() => {
    if (stagedFiles.length === 0) return;
    onSubmit(stagedFiles, true);
  }, [stagedFiles, onSubmit]);

  const handleSubmitCopy = useCallback(() => {
    if (stagedFiles.length === 0) return;
    const resolved = stagedFiles.map((f) => {
      if (existingNamesSet.has(f.name)) {
        const dotIdx = f.name.lastIndexOf(".");
        const newName =
          dotIdx > 0
            ? `${f.name.slice(0, dotIdx)} (copy)${f.name.slice(dotIdx)}`
            : `${f.name} (copy)`;
        return { ...f, name: newName };
      }
      return f;
    });
    onSubmit(resolved, false);
  }, [stagedFiles, existingNamesSet, onSubmit]);

  const handleSubmit = useCallback(() => {
    if (stagedFiles.length === 0) return;
    onSubmit(stagedFiles, false);
  }, [stagedFiles, onSubmit]);

  const handleClose = useCallback(() => {
    if (isUploading) return;
    setStagedFiles([]);
    onClose();
  }, [isUploading, onClose]);

  const options: ActionOption[] = [
    { label: "Take Photo", icon: "camera.fill", action: takePhoto },
    { label: "Choose Photos", icon: "photo.fill", action: pickImages },
    { label: "Choose Documents", icon: "doc.fill", action: pickDocuments },
  ];

  const hasProgress = isUploading && uploadTotal != null && uploadTotal > 0;

  return (
    <AppModal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable
        style={s.overlay}
        onPress={dismissOnBackdropPress && !isUploading ? handleClose : undefined}
      >
        <Pressable style={[s.sheet, { backgroundColor: c.bg, borderColor: c.border }]}>
          <View style={[s.handle, { backgroundColor: c.border }]} />

          {isUploading ? (
            <View style={s.loadingContainer}>
              <ActivityIndicator size="large" color={c.primary} />
              <Text style={[s.loadingText, { color: c.textSecondary }]}>
                {hasProgress
                  ? `Uploading ${uploadCompleted ?? 0} of ${uploadTotal}...`
                  : "Uploading..."}
              </Text>
              {hasProgress && (
                <View style={s.progressBarOuter}>
                  <View
                    style={[
                      s.progressBarInner,
                      {
                        backgroundColor: c.primary,
                        width: `${((uploadCompleted ?? 0) / uploadTotal) * 100}%`,
                      },
                    ]}
                  />
                </View>
              )}
            </View>
          ) : (
            <>
              <View style={s.titleRow}>
                <Text style={[s.title, { color: c.text }]}>Add Attachments</Text>
                {picking && <ActivityIndicator size="small" color={c.primary} />}
              </View>

              {/* Picker options row */}
              <View style={s.pickerRow}>
                {options.map((option) => (
                  <Pressable
                    key={option.label}
                    style={[
                      s.pickerOption,
                      { borderColor: c.border, backgroundColor: c.bgSecondary },
                      picking && s.pickerOptionDisabled,
                    ]}
                    onPress={() => void handlePick(option.action)}
                    disabled={picking}
                  >
                    <IconSymbol
                      name={option.icon as never}
                      size={22}
                      color={picking ? c.muted : c.primary}
                    />
                    <Text style={[s.pickerOptionLabel, { color: picking ? c.muted : c.text }]}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Staged files — horizontal carousel */}
              {stagedFiles.length > 0 && (
                <View style={s.stagedSection}>
                  <Text style={[s.stagedLabel, { color: c.textSecondary }]}>
                    {stagedFiles.length} file{stagedFiles.length > 1 ? "s" : ""} selected
                  </Text>
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.carouselContent}
                  >
                    {stagedFiles.map((file, index) => {
                      const isImage = file.mimeType.startsWith("image/");
                      const isDuplicate = existingNamesSet.has(file.name);
                      return (
                        <View
                          key={`${file.uri}-${file.name}-${
                            // biome-ignore lint/suspicious/noArrayIndexKey: Staged files are mutable and can have duplicates, so index is needed to ensure unique keys
                            index
                          }`}
                          style={[
                            s.card,
                            {
                              borderColor: isDuplicate ? c.warning : c.border,
                              backgroundColor: c.bgSecondary,
                            },
                            isDuplicate && s.cardDuplicate,
                          ]}
                        >
                          {isImage ? (
                            <Image
                              source={{ uri: file.uri }}
                              style={s.cardThumb}
                              contentFit="cover"
                              recyclingKey={file.uri}
                            />
                          ) : (
                            <View
                              style={[s.cardThumb, s.cardDocPlaceholder, { backgroundColor: c.bg }]}
                            >
                              <IconSymbol name="doc.fill" size={28} color={c.textSecondary} />
                            </View>
                          )}
                          <View style={s.cardInfo}>
                            <Text style={[s.cardName, { color: c.text }]} numberOfLines={2}>
                              {file.name}
                            </Text>
                            {isDuplicate && (
                              <Text style={[s.cardDuplicateLabel, { color: c.warning }]}>
                                Already exists
                              </Text>
                            )}
                            {file.size != null && !isDuplicate && (
                              <Text style={[s.cardSize, { color: c.textSecondary }]}>
                                {formatFileSize(file.size)}
                              </Text>
                            )}
                          </View>
                          <Pressable
                            onPress={() => handleRemoveFile(index)}
                            hitSlop={6}
                            style={s.cardRemove}
                          >
                            <IconSymbol name="xmark.circle.fill" size={20} color={c.bg} />
                          </Pressable>
                        </View>
                      );
                    })}
                  </ScrollView>
                  {stagedFiles.length > 1 && (
                    <View style={s.browseHintRow}>
                      <IconSymbol name="chevron.left" size={10} color={c.muted} />
                      <Text style={[s.browseHintText, { color: c.muted }]}>Browse</Text>
                      <IconSymbol name="chevron.right" size={10} color={c.muted} />
                    </View>
                  )}
                </View>
              )}

              {/* Duplicate warning banner */}
              {hasDuplicates && (
                <View
                  style={[
                    s.duplicateBanner,
                    {
                      backgroundColor: c.bg ?? "rgba(255,200,50,0.1)",
                      borderColor: c.warning,
                    },
                  ]}
                >
                  <IconSymbol name="exclamationmark.triangle.fill" size={14} color={c.warning} />
                  <Text style={[s.duplicateBannerText, { color: c.text }]}>
                    {duplicateNames.length} file{duplicateNames.length > 1 ? "s" : ""} already
                    {duplicateNames.length > 1 ? " exist" : " exists"}.
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View style={s.bottomActions}>
                {stagedFiles.length > 0 ? (
                  hasDuplicates ? (
                    <>
                      <Pressable
                        style={[s.submitBtn, { backgroundColor: c.primary }]}
                        onPress={handleSubmitReplace}
                      >
                        <IconSymbol name="arrow.triangle.2.circlepath" size={16} color="#ffffff" />
                        <Text style={s.submitBtnText}>Replace Existing</Text>
                      </Pressable>
                      <Pressable
                        style={[
                          s.submitBtn,
                          { backgroundColor: c.bgSecondary, borderWidth: 1, borderColor: c.border },
                        ]}
                        onPress={handleSubmitCopy}
                      >
                        <IconSymbol name="doc.on.doc.fill" size={16} color={c.text} />
                        <Text style={[s.submitBtnText, { color: c.text }]}>Keep Both</Text>
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      style={[s.submitBtn, { backgroundColor: c.primary }]}
                      onPress={handleSubmit}
                    >
                      <IconSymbol name="arrow.up.circle.fill" size={18} color="#ffffff" />
                      <Text style={s.submitBtnText}>
                        Upload {stagedFiles.length} File{stagedFiles.length > 1 ? "s" : ""}
                      </Text>
                    </Pressable>
                  )
                ) : null}
                <Pressable
                  style={[s.cancelBtn, { backgroundColor: c.bgSecondary }]}
                  onPress={handleClose}
                >
                  <Text style={[s.cancelText, { color: c.textSecondary }]}>Cancel</Text>
                </Pressable>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </AppModal>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const CARD_WIDTH = 120;
const THUMB_HEIGHT = 90;

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingBottom: 34,
    paddingTop: 12,
    maxHeight: "75%",
    ...(isWeb ? { maxWidth: 520, width: "100%", alignSelf: "center" as const } : {}),
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.semibold,
  },
  pickerRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  pickerOption: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  pickerOptionDisabled: {
    opacity: 0.5,
  },
  pickerOptionLabel: {
    fontSize: 11,
    fontFamily: fonts.medium,
    textAlign: "center",
  },
  stagedSection: {
    marginTop: 16,
  },
  stagedLabel: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  carouselContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardDuplicate: {
    borderWidth: 2,
  },
  cardThumb: {
    width: CARD_WIDTH,
    height: THUMB_HEIGHT,
  },
  cardDocPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 8,
    gap: 2,
  },
  cardName: {
    fontSize: 11,
    fontFamily: fonts.medium,
    lineHeight: 14,
  },
  cardSize: {
    fontSize: 10,
    fontFamily: fonts.regular,
  },
  cardDuplicateLabel: {
    fontSize: 9,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardRemove: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 10,
  },
  duplicateBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    marginHorizontal: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  duplicateBannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  bottomActions: {
    marginTop: 16,
    gap: 8,
    paddingHorizontal: 20,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.lg,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: "#ffffff",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: radius.lg,
  },
  cancelText: {
    fontSize: 16,
    fontFamily: fonts.semibold,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  progressBarOuter: {
    width: "80%",
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(128,128,128,0.2)",
    overflow: "hidden",
  },
  progressBarInner: {
    height: "100%",
    borderRadius: 2,
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
