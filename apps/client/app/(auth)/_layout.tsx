import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { WebPageShell } from "@/components/ui/web-page-shell";
import { useTheme } from "@/styles";

export default function AuthLayout() {
  const { colors: c, isDark } = useTheme();

  // react-navigation paints `colors.background` behind Stack screens, which would
  // cover the WebPageShell background image. Override to transparent for auth.
  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const transparentTheme = {
    ...baseTheme,
    colors: { ...baseTheme.colors, background: "transparent", card: "transparent" },
  };

  return (
    <WebPageShell
      backgroundImage
      headerStyle={{ backgroundColor: c.bg }}
      footerStyle={{ backgroundColor: c.bg }}
      headerTextStyle={{ color: c.text }}
      contentStyle={{ width: "75%" }}
      footerTextStyle={{ color: c.text }}
    >
      <ThemeProvider value={transparentTheme}>
        <Stack screenOptions={{ headerShown: false }} initialRouteName="sign-in">
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="sign-up" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="reset-password" />
          <Stack.Screen name="verify-email" />
          <Stack.Screen name="two-factor-verify" />
        </Stack>
      </ThemeProvider>
    </WebPageShell>
  );
}
