import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { fonts, useTheme } from "@/styles";

const AVATAR_MAX_DIMENSION = 512;

async function pickAndDownscale(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const longest = Math.max(asset.width ?? 0, asset.height ?? 0);
  const actions =
    longest > AVATAR_MAX_DIMENSION
      ? [{ resize: { width: AVATAR_MAX_DIMENSION, height: AVATAR_MAX_DIMENSION } }]
      : [];

  const manipulated = await manipulateAsync(asset.uri, actions, {
    compress: 0.8,
    format: SaveFormat.JPEG,
  });

  return manipulated.uri;
}

interface AvatarEditorProps {
  imageUrl: string | null;
  fallbackText: string;
  size?: number;
  borderRadius?: number;
  editable?: boolean;
  onUpload: (uri: string) => Promise<void>;
}

export function AvatarEditor({
  imageUrl,
  fallbackText,
  size = 80,
  borderRadius: br,
  editable = true,
  onUpload,
}: AvatarEditorProps) {
  const { colors: c } = useTheme();
  const [busy, setBusy] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const resolvedRadius = br ?? size / 2;

  const displayUrl = localPreview ?? imageUrl;

  const handlePress = async () => {
    if (!editable) return;
    setBusy(true);
    try {
      const uri = await pickAndDownscale();
      if (!uri) return;
      await onUpload(uri);
      setLocalPreview(uri);
    } finally {
      setBusy(false);
    }
  };

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: resolvedRadius,
    backgroundColor: c.primaryMuted,
    borderColor: c.border,
  };

  const imageStyle = {
    position: "absolute" as const,
    width: size,
    height: size,
    borderRadius: resolvedRadius,
  };

  return (
    <Pressable onPress={editable ? handlePress : undefined} disabled={busy}>
      <View style={{ width: size, height: size }}>
        <View style={[s.container, containerStyle]}>
          {busy ? (
            <ActivityIndicator />
          ) : (
            <>
              {displayUrl ? (
                <Image
                  source={{ uri: displayUrl }}
                  style={[imageStyle, !imageLoaded && s.hidden]}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setLocalPreview(null);
                    setImageLoaded(false);
                  }}
                />
              ) : null}
              {!imageLoaded && !busy ? (
                <Text style={[s.fallback, { color: c.text, fontSize: size * 0.4 }]}>
                  {fallbackText}
                </Text>
              ) : null}
            </>
          )}
        </View>
        {editable && (
          <View style={[s.badge, { backgroundColor: c.primary }]}>
            <IconSymbol name="square.and.pencil" size={10} color="#ffffff" />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  container: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fallback: {
    fontFamily: fonts.bold,
  },
  hidden: {
    opacity: 0,
  },
  badge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});
