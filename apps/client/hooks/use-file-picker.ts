import * as DocumentPicker from "expo-document-picker";
import type { Action } from "expo-image-manipulator";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useCallback } from "react";
import { Alert, Linking } from "react-native";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_IMAGE_DIMENSION = 2048;

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  size: number | null;
}

function extractFileName(uri: string): string {
  const segments = uri.split("/");
  return segments[segments.length - 1] ?? "file";
}

function showPermissionAlert(type: "camera" | "photos") {
  const label = type === "camera" ? "Camera" : "Photo Library";
  Alert.alert(
    `${label} Access Required`,
    `Please grant ${label.toLowerCase()} access in Settings to use this feature.`,
    [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() },
    ],
  );
}

function filterOversized(files: PickedFile[]): PickedFile[] {
  const valid: PickedFile[] = [];
  const oversized: string[] = [];

  for (const file of files) {
    if (file.size != null && file.size > MAX_FILE_SIZE_BYTES) {
      oversized.push(file.name);
    } else {
      valid.push(file);
    }
  }

  if (oversized.length > 0) {
    Alert.alert(
      "Files Too Large",
      `These files exceed the 10 MB limit and were skipped:\n${oversized.join("\n")}`,
    );
  }

  return valid;
}

/**
 * Downsize an image to MAX_IMAGE_DIMENSION on its longest side and compress as JPEG.
 * Returns a new URI pointing to the resized image.
 */
async function compressImage(
  uri: string,
  width?: number,
  height?: number,
): Promise<{ uri: string; size: number | null }> {
  const actions: Action[] = [];

  const w = width ?? 0;
  const h = height ?? 0;
  const longest = Math.max(w, h);

  if (longest > MAX_IMAGE_DIMENSION && longest > 0) {
    if (w >= h) {
      actions.push({ resize: { width: MAX_IMAGE_DIMENSION } });
    } else {
      actions.push({ resize: { height: MAX_IMAGE_DIMENSION } });
    }
  }

  const result = await manipulateAsync(uri, actions, {
    compress: 0.8,
    format: SaveFormat.JPEG,
  });

  return { uri: result.uri, size: null };
}

async function assetToPickedFile(asset: ImagePicker.ImagePickerAsset): Promise<PickedFile> {
  const { uri, size } = await compressImage(asset.uri, asset.width, asset.height);

  // Derive name: replace original extension with .jpg since we compress to JPEG
  const originalName = asset.fileName ?? extractFileName(asset.uri);
  const dotIdx = originalName.lastIndexOf(".");
  const name = dotIdx > 0 ? `${originalName.slice(0, dotIdx)}.jpg` : `${originalName}.jpg`;

  return {
    uri,
    name,
    mimeType: "image/jpeg",
    size,
  };
}

export function useFilePicker() {
  const pickImages = useCallback(
    async (opts?: { allowsEditing?: boolean }): Promise<PickedFile[]> => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showPermissionAlert("photos");
        return [];
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: 20,
        allowsEditing: opts?.allowsEditing ?? false,
        quality: 1, // Full quality — we compress ourselves
      });

      if (result.canceled || result.assets.length === 0) return [];

      const files = await Promise.all(result.assets.map(assetToPickedFile));
      return filterOversized(files);
    },
    [],
  );

  const takePhoto = useCallback(async (): Promise<PickedFile[]> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showPermissionAlert("camera");
      return [];
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (result.canceled || result.assets.length === 0) return [];

    const files = await Promise.all(result.assets.map(assetToPickedFile));
    return filterOversized(files);
  }, []);

  const pickDocuments = useCallback(async (): Promise<PickedFile[]> => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
      multiple: true,
    });

    if (result.canceled || result.assets.length === 0) return [];

    const files: PickedFile[] = result.assets.map((asset) => ({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? "application/octet-stream",
      size: asset.size ?? null,
    }));

    return filterOversized(files);
  }, []);

  const pickPDFs = useCallback(async (): Promise<PickedFile[]> => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
      multiple: true,
    });

    if (result.canceled || result.assets.length === 0) return [];

    const files: PickedFile[] = result.assets.map((asset) => ({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? "application/pdf",
      size: asset.size ?? null,
    }));

    return filterOversized(files);
  }, []);

  return { pickImages, takePhoto, pickDocuments, pickPDFs };
}
