import { useCallback, useRef, useState } from "react";
import type { NativeSyntheticEvent } from "react-native";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
  EnrichedTextInput,
  type EnrichedTextInputInstance,
  type OnChangeHtmlEvent,
  type OnChangeSelectionEvent,
  type OnChangeStateEvent,
} from "react-native-enriched";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { radius, spacing, useTheme } from "@/styles";

type ToolbarPreset = "full" | "minimal";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  toolbar?: ToolbarPreset;
  testID?: string;
}

type StyleKey =
  | "bold"
  | "italic"
  | "underline"
  | "strikeThrough"
  | "orderedList"
  | "unorderedList"
  | "blockQuote"
  | "inlineCode"
  | "codeBlock"
  | "link"
  | "h2"
  | "h3";

type StyleState = Record<StyleKey, boolean>;

const TOOLBAR_FULL: { icon: string; key: StyleKey }[] = [
  { icon: "bold", key: "bold" },
  { icon: "italic", key: "italic" },
  { icon: "underline", key: "underline" },
  { icon: "strikethrough", key: "strikeThrough" },
  { icon: "list.bullet", key: "unorderedList" },
  { icon: "list.number", key: "orderedList" },
  { icon: "text.quote", key: "blockQuote" },
  { icon: "chevron.left.forwardslash.chevron.right", key: "inlineCode" },
  { icon: "curlybraces", key: "codeBlock" },
  { icon: "link", key: "link" },
  { icon: "textformat.size", key: "h2" },
  { icon: "textformat.size.smaller", key: "h3" },
];

const TOOLBAR_MINIMAL: { icon: string; key: StyleKey }[] = [
  { icon: "bold", key: "bold" },
  { icon: "italic", key: "italic" },
  { icon: "underline", key: "underline" },
  { icon: "strikethrough", key: "strikeThrough" },
];

const DEFAULT_STATE: StyleState = {
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  orderedList: false,
  unorderedList: false,
  blockQuote: false,
  inlineCode: false,
  codeBlock: false,
  link: false,
  h2: false,
  h3: false,
};

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  toolbar = "full",
  testID,
}: RichTextEditorProps) {
  const { colors: c } = useTheme();
  const inputRef = useRef<EnrichedTextInputInstance>(null);
  const selectionRef = useRef({ start: 0, end: 0, text: "" });
  const [styleState, setStyleState] = useState<StyleState>(DEFAULT_STATE);

  const buttons = toolbar === "full" ? TOOLBAR_FULL : TOOLBAR_MINIMAL;

  const promptForLink = useCallback((ref: EnrichedTextInputInstance) => {
    const sel = selectionRef.current;
    if (sel.start === sel.end) return;
    Alert.prompt("Add Link", "Enter URL", (url) => {
      if (!url) return;
      const normalized = url.startsWith("http") ? url : `https://${url}`;
      ref.setLink(sel.start, sel.end, sel.text, normalized);
    });
  }, []);

  const handleToggle = useCallback(
    (key: StyleKey) => {
      const ref = inputRef.current;
      if (!ref) return;
      switch (key) {
        case "bold":
          ref.toggleBold();
          break;
        case "italic":
          ref.toggleItalic();
          break;
        case "underline":
          ref.toggleUnderline();
          break;
        case "strikeThrough":
          ref.toggleStrikeThrough();
          break;
        case "unorderedList":
          ref.toggleUnorderedList();
          break;
        case "orderedList":
          ref.toggleOrderedList();
          break;
        case "blockQuote":
          ref.toggleBlockQuote();
          break;
        case "inlineCode":
          ref.toggleInlineCode();
          break;
        case "codeBlock":
          ref.toggleCodeBlock();
          break;
        case "link":
          promptForLink(ref);
          break;
        case "h2":
          ref.toggleH2();
          break;
        case "h3":
          ref.toggleH3();
          break;
      }
    },
    [promptForLink],
  );

  const handleStateChange = useCallback((e: NativeSyntheticEvent<OnChangeStateEvent>) => {
    const s = e.nativeEvent;
    setStyleState({
      bold: s.bold.isActive,
      italic: s.italic.isActive,
      underline: s.underline.isActive,
      strikeThrough: s.strikeThrough.isActive,
      orderedList: s.orderedList.isActive,
      unorderedList: s.unorderedList.isActive,
      blockQuote: s.blockQuote.isActive,
      inlineCode: s.inlineCode.isActive,
      codeBlock: s.codeBlock.isActive,
      link: s.link.isActive,
      h2: s.h2.isActive,
      h3: s.h3.isActive,
    });
  }, []);

  const handleSelectionChange = useCallback((e: NativeSyntheticEvent<OnChangeSelectionEvent>) => {
    const { start, end, text } = e.nativeEvent;
    selectionRef.current = { start, end, text };
  }, []);

  const handleHtmlChange = useCallback(
    (e: NativeSyntheticEvent<OnChangeHtmlEvent>) => {
      onChange(e.nativeEvent.value);
    },
    [onChange],
  );

  return (
    <View style={styles.container} testID={testID}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.toolbar, { borderBottomColor: c.border, backgroundColor: c.bgSecondary }]}
        contentContainerStyle={styles.toolbarContent}
        keyboardShouldPersistTaps="always"
      >
        {buttons.map((btn) => {
          const active = styleState[btn.key];
          return (
            <Pressable
              key={btn.key}
              style={[styles.toolbarBtn, active && { backgroundColor: c.primaryMuted }]}
              onPress={() => handleToggle(btn.key)}
            >
              <IconSymbol name={btn.icon} size={18} color={active ? c.primary : c.textSecondary} />
            </Pressable>
          );
        })}
      </ScrollView>
      <EnrichedTextInput
        ref={inputRef}
        defaultValue={value}
        onChangeHtml={handleHtmlChange}
        onChangeState={handleStateChange}
        onChangeSelection={handleSelectionChange}
        placeholder={placeholder}
        useHtmlNormalizer
        style={{
          flex: 1,
          fontSize: 16,
          color: c.text,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        }}
        htmlStyle={{
          h2: { fontSize: 20, bold: true },
          h3: { fontSize: 18, bold: true },
          a: { color: c.primary, textDecorationLine: "underline" },
          ul: { marginLeft: 16 },
          ol: { marginLeft: 16 },
          blockquote: {
            borderColor: c.border,
            borderWidth: 3,
            gapWidth: 12,
            color: c.textSecondary,
          },
          code: {
            color: c.primary,
            backgroundColor: c.bgSecondary,
          },
          codeblock: {
            color: c.text,
            backgroundColor: c.bgSecondary,
            borderRadius: 8,
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    borderBottomWidth: 1,
    maxHeight: 52,
  },
  toolbarContent: {
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  toolbarBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
