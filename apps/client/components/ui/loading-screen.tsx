import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AppLogo } from "@/components/ui/app-logo";
import { colors } from "@/styles";

type LoadingScreenProps = {
  /** Use system color scheme when AppearanceProvider isn't available yet */
  dark?: boolean;
  /** Themed background color — takes priority over `dark` */
  backgroundColor?: string;
  /** Show a small spinner below the logo */
  showSpinner?: boolean;
  /** Spinner color */
  spinnerColor?: string;
};

export function LoadingScreen({
  dark,
  backgroundColor,
  showSpinner,
  spinnerColor,
}: LoadingScreenProps) {
  const bg = backgroundColor ?? (dark ? colors.dark.bg : colors.light.bg);

  return (
    <View style={[s.container, { backgroundColor: bg }]}>
      <AppLogo variant="splash" size={200} testID="loading-screen-logo" />
      {showSpinner ? (
        <ActivityIndicator style={s.spinner} size="small" color={spinnerColor} />
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    position: "absolute",
    bottom: "30%",
  },
});
