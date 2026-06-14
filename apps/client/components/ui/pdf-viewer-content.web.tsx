import { StyleSheet, View } from "react-native";

interface PdfViewerContentProps {
  url: string;
  title?: string;
}

export function PdfViewerContent({ url, title }: PdfViewerContentProps) {
  return (
    <View style={s.container}>
      <iframe src={url} title={title ?? "PDF"} style={s.iframe} />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  iframe: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderWidth: 0,
    borderColor: "transparent",
  },
});
