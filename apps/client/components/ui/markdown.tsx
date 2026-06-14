import { useMemo } from "react";
import { StyleSheet } from "react-native";
import Markdown from "react-native-markdown-renderer";

import { fonts, useTheme } from "@/styles";

export function ThemedMarkdown({ children }: { children: string }) {
  const { colors: c } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        text: { color: c.text, fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
        strong: { fontFamily: fonts.bold },
        em: { fontStyle: "italic" },
        heading1: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 30, marginVertical: 4 },
        heading2: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 28, marginVertical: 4 },
        heading3: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 26, marginVertical: 2 },
        link: { color: c.primary, textDecorationLine: "underline" },
        blockquote: {
          borderLeftWidth: 3,
          borderLeftColor: c.border,
          paddingLeft: 12,
          marginVertical: 4,
        },
        codeInline: {
          fontFamily: "monospace",
          fontSize: 14,
          backgroundColor: c.surface,
          borderRadius: 4,
          paddingHorizontal: 4,
          paddingVertical: 1,
        },
        codeBlock: {
          fontFamily: "monospace",
          fontSize: 14,
          backgroundColor: c.surface,
          borderRadius: 8,
          padding: 12,
          marginVertical: 4,
        },
        pre: {
          fontFamily: "monospace",
          fontSize: 14,
          backgroundColor: c.surface,
          borderRadius: 8,
          padding: 12,
          marginVertical: 4,
        },
        listItem: { marginVertical: 2 },
        listUnorderedItemIcon: { color: c.text },
        listUnorderedItemText: { color: c.text },
        listOrderedItemIcon: { color: c.text },
        listOrderedItemText: { color: c.text },
        listOrdered: { marginVertical: 4 },
        listUnordered: { marginVertical: 4 },
        paragraph: { marginVertical: 2 },
        hr: { backgroundColor: c.border, height: 1, marginVertical: 8 },
      }),
    [c],
  );

  return <Markdown style={styles}>{children}</Markdown>;
}
