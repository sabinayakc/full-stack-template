import type { FileUIPart } from "ai";
import { File } from "expo-file-system";
import type { PickedFile } from "@/hooks/use-file-picker";

/**
 * Convert a PickedFile to a FileUIPart by reading its content as a base64 data URI.
 * Used for both images and PDFs — the model handles them natively via its capabilities.
 */
export async function pickedFileToFileUIPart(file: PickedFile): Promise<FileUIPart> {
  const expoFile = new File(file.uri);
  const buffer = await expoFile.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Convert to base64 in chunks to avoid call stack overflow on large files
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const base64 = btoa(binary);

  return {
    type: "file",
    mediaType: file.mimeType,
    filename: file.name,
    url: `data:${file.mimeType};base64,${base64}`,
  };
}
