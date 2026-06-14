import { Modal, type ModalProps, Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "@/styles";

/**
 * Drop-in replacement for React Native's Modal.
 * Wraps content in SafeAreaProvider so useSafeAreaInsets() works inside modals.
 * Renders full-screen on all platforms — modal content is responsible for its own
 * width constraints (e.g. centering a max-width panel).
 */
export function AppModal({ children, ...props }: ModalProps) {
  const { colors: c } = useTheme();
  const needsWebPadding = Platform.OS === "web" && !props.transparent;
  return (
    <Modal {...props}>
      <SafeAreaProvider>
        {needsWebPadding ? (
          <View style={{ flex: 1, paddingVertical: 16, backgroundColor: c.bg }}>{children}</View>
        ) : (
          children
        )}
      </SafeAreaProvider>
    </Modal>
  );
}
