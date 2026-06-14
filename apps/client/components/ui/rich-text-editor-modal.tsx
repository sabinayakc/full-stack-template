import { useCallback, useRef } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppModal } from "@/components/ui/app-modal";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { fonts, spacing, useTheme } from "@/styles";

type ToolbarPreset = "full" | "minimal";

interface RichTextEditorModalProps {
  visible: boolean;
  title: string;
  value: string;
  toolbar?: ToolbarPreset;
  onSave: (html: string) => void;
  onCancel: () => void;
  testID?: string;
}

export function RichTextEditorModal({
  visible,
  title,
  value,
  toolbar = "full",
  onSave,
  onCancel,
  testID,
}: RichTextEditorModalProps) {
  const draftRef = useRef(value);

  const handleChange = useCallback((html: string) => {
    draftRef.current = html;
  }, []);

  const handleSave = useCallback(() => {
    onSave(draftRef.current);
  }, [onSave]);

  return (
    <AppModal visible={visible} animationType="slide" onRequestClose={onCancel} testID={testID}>
      <ModalInner
        title={title}
        toolbar={toolbar}
        value={value}
        onChange={handleChange}
        onSave={handleSave}
        onCancel={onCancel}
      />
    </AppModal>
  );
}

function ModalInner({
  title,
  toolbar,
  value,
  onChange,
  onSave,
  onCancel,
}: {
  title: string;
  toolbar: ToolbarPreset;
  value: string;
  onChange: (html: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { colors: c } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        s.container,
        { backgroundColor: c.bg, paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[s.header, { borderBottomColor: c.border }]}>
          <Pressable onPress={onCancel} hitSlop={8}>
            <Text style={[s.headerBtn, { color: c.textSecondary }]}>Cancel</Text>
          </Pressable>
          <Text style={[s.headerTitle, { color: c.text }]} numberOfLines={1}>
            {title}
          </Text>
          <Pressable onPress={onSave} hitSlop={8}>
            <Text style={[s.headerBtn, { color: c.primary }]}>Save</Text>
          </Pressable>
        </View>
        <RichTextEditor value={value} onChange={onChange} toolbar={toolbar} />
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerBtn: {
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    flex: 1,
    textAlign: "center",
    marginHorizontal: spacing.md,
  },
});
