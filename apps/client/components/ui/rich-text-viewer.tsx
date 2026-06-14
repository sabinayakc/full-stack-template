import { StyleSheet, Text, type TextStyle, View, type ViewStyle } from "react-native";
import { fonts, useTheme } from "@/styles";

interface RichTextViewerProps {
  html: string;
  numberOfLines?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const TAG_STRIP_RE = /<[^>]*>/g;

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(TAG_STRIP_RE, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function RichTextViewer({ html, numberOfLines, style, textStyle }: RichTextViewerProps) {
  const { colors: c } = useTheme();
  const plainText = stripHtml(html);

  if (!plainText) {
    return (
      <View style={style}>
        <Text style={[s.placeholder, { color: c.textSecondary }, textStyle]}>No content</Text>
      </View>
    );
  }

  return (
    <View style={style}>
      <Text style={[s.text, { color: c.text }, textStyle]} numberOfLines={numberOfLines}>
        {plainText}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  text: {
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
  placeholder: {
    fontSize: 14,
    fontFamily: fonts.regular,
    fontStyle: "italic",
  },
});
