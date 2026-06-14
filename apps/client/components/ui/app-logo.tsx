import { Image, type ImageProps, type ImageStyle } from "expo-image";
import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";

type AppLogoVariant = "icon" | "splash";

type AppLogoProps = {
  variant?: AppLogoVariant;
  size?: number;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
} & Omit<ImageProps, "source" | "style">;

const sources = {
  icon: require("@/assets/images/icon.png"),
  splash: require("@/assets/images/splash-icon.png"),
} as const;

export function AppLogo({
  variant = "icon",
  size = 28,
  style,
  containerStyle,
  testID,
  ...rest
}: AppLogoProps) {
  const image = (
    <Image
      source={sources[variant]}
      style={[
        { width: size, height: size, borderRadius: variant === "icon" ? size * 0.15 : 0 },
        style,
      ]}
      contentFit="contain"
      testID={testID}
      {...rest}
    />
  );

  if (containerStyle) {
    return <View style={[s.container, containerStyle]}>{image}</View>;
  }

  return image;
}

const s = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
