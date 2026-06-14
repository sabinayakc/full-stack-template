import * as Clipboard from "expo-clipboard";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useToast } from "@/providers/toast-provider";
import { fonts, radius, spacing, useTheme } from "@/styles";

interface BackupCodesDisplayProps {
  codes: string[];
  testID?: string;
}

export function BackupCodesDisplay({ codes, testID }: BackupCodesDisplayProps) {
  const { colors: c } = useTheme();
  const toast = useToast();

  const handleCopyAll = async () => {
    await Clipboard.setStringAsync(codes.join("\n"));
    toast.success("Backup codes copied to clipboard");
  };

  return (
    <View testID={testID}>
      <View style={[s.grid, { backgroundColor: c.surface, borderColor: c.border }]}>
        {codes.map((code, i) => (
          <View
            key={code}
            style={[s.codeCell, i % 2 === 0 && { borderRightWidth: 1, borderRightColor: c.border }]}
          >
            <Text style={[s.codeText, { color: c.text }]}>{code}</Text>
          </View>
        ))}
      </View>

      <Pressable style={[s.copyBtn, { borderColor: c.border }]} onPress={handleCopyAll}>
        <IconSymbol name="doc.on.doc" size={16} color={c.primary} />
        <Text style={[s.copyBtnText, { color: c.primary }]}>Copy All Codes</Text>
      </Pressable>

      <View
        style={[s.warningBox, { backgroundColor: `${c.accent}1A`, borderColor: `${c.accent}4D` }]}
      >
        <IconSymbol name="exclamationmark.triangle.fill" size={16} color={c.accent} />
        <Text style={[s.warningText, { color: c.textSecondary }]}>
          Store these codes in a safe place. Each code can only be used once. If you lose access to
          your authenticator app, you can use these codes to sign in.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  codeCell: {
    width: "50%",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  codeText: {
    fontSize: 15,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  copyBtnText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.regular,
    lineHeight: 18,
  },
});
