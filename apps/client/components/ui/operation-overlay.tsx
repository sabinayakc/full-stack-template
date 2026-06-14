import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "@/styles";

interface OperationOverlayProps {
  visible: boolean;
  children: React.ReactNode;
}

/**
 * Wraps children with a semi-transparent overlay + spinner when `visible` is true.
 * Use on cards/containers to indicate an in-flight server operation.
 */
export function OperationOverlay({ visible, children }: OperationOverlayProps) {
  const { colors: c } = useTheme();

  return (
    <View style={s.wrapper}>
      {children}
      {visible && (
        <View style={s.overlay}>
          <ActivityIndicator size="small" color={c.primary} />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(128,128,128,0.25)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});
