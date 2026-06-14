import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
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

type ToolbarButton = {
  icon: string;
  key: string;
  command: string;
  arg?: string;
};

const TOOLBAR_FULL: ToolbarButton[] = [
  { icon: "bold", key: "bold", command: "bold" },
  { icon: "italic", key: "italic", command: "italic" },
  { icon: "underline", key: "underline", command: "underline" },
  { icon: "strikethrough", key: "strikeThrough", command: "strikeThrough" },
  { icon: "list.bullet", key: "unorderedList", command: "insertUnorderedList" },
  { icon: "list.number", key: "orderedList", command: "insertOrderedList" },
  { icon: "text.quote", key: "blockQuote", command: "formatBlock", arg: "blockquote" },
  {
    icon: "chevron.left.forwardslash.chevron.right",
    key: "inlineCode",
    command: "formatBlock",
    arg: "code",
  },
  { icon: "curlybraces", key: "codeBlock", command: "formatBlock", arg: "pre" },
  { icon: "link", key: "link", command: "createLink" },
  { icon: "textformat.size", key: "h2", command: "formatBlock", arg: "h2" },
  { icon: "textformat.size.smaller", key: "h3", command: "formatBlock", arg: "h3" },
];

const TOOLBAR_MINIMAL: ToolbarButton[] = [
  { icon: "bold", key: "bold", command: "bold" },
  { icon: "italic", key: "italic", command: "italic" },
  { icon: "underline", key: "underline", command: "underline" },
  { icon: "strikethrough", key: "strikeThrough", command: "strikeThrough" },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  toolbar = "full",
  testID,
}: RichTextEditorProps) {
  const { colors: c } = useTheme();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastValueRef = useRef(value);
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});

  const buttons = toolbar === "full" ? TOOLBAR_FULL : TOOLBAR_MINIMAL;

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (value !== lastValueRef.current && value !== el.innerHTML) {
      el.innerHTML = value || "";
      lastValueRef.current = value;
    }
  }, [value]);

  const refreshActiveStates = useCallback(() => {
    if (typeof document === "undefined") return;
    const next: Record<string, boolean> = {};
    for (const btn of buttons) {
      try {
        next[btn.key] = document.queryCommandState(btn.command);
      } catch {
        next[btn.key] = false;
      }
    }
    setActiveStates(next);
  }, [buttons]);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    lastValueRef.current = html;
    onChange(html);
    refreshActiveStates();
  }, [onChange, refreshActiveStates]);

  const exec = useCallback(
    (btn: ToolbarButton) => {
      const el = editorRef.current;
      if (!el) return;
      el.focus();
      if (btn.command === "createLink") {
        const url = window.prompt("Enter URL");
        if (!url) return;
        const normalized = url.startsWith("http") ? url : `https://${url}`;
        document.execCommand("createLink", false, normalized);
      } else if (btn.arg) {
        document.execCommand(btn.command, false, btn.arg);
      } else {
        document.execCommand(btn.command, false);
      }
      handleInput();
    },
    [handleInput],
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
          const active = activeStates[btn.key];
          return (
            <Pressable
              key={btn.key}
              style={[styles.toolbarBtn, active && { backgroundColor: c.primaryMuted }]}
              onPress={() => exec(btn)}
            >
              <IconSymbol name={btn.icon} size={18} color={active ? c.primary : c.textSecondary} />
            </Pressable>
          );
        })}
      </ScrollView>
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div, not input/textarea */}
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        tabIndex={0}
        aria-multiline="true"
        aria-label={placeholder}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        onKeyUp={refreshActiveStates}
        onMouseUp={refreshActiveStates}
        onFocus={refreshActiveStates}
        style={{
          flex: 1,
          minHeight: 120,
          fontSize: 16,
          color: c.text,
          padding: `${spacing.md}px ${spacing.lg}px`,
          outline: "none",
          overflow: "auto",
        }}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted local HTML
        dangerouslySetInnerHTML={{ __html: value || "" }}
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
