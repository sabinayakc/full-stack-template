import { useCallback, useState } from "react";

export interface UploadResult {
  key: string;
}

export interface UploadAndRegisterResult<T> {
  succeeded: T[];
  failed: number;
}

interface UploadState {
  isUploading: boolean;
  completed: number;
  total: number;
  error: string | null;
}

interface PresignedUploadOpts {
  getUploadUrl: (contentType: string) => Promise<{ uploadUrl: string; key: string }>;
}

async function uploadOne(
  fileUri: string,
  mimeType: string,
  getUploadUrl: PresignedUploadOpts["getUploadUrl"],
): Promise<UploadResult> {
  const { uploadUrl, key } = await getUploadUrl(mimeType);

  const response = await fetch(fileUri);
  const blob = await response.blob();

  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: blob,
  });

  if (!putResponse.ok) {
    throw new Error(`Upload failed: ${putResponse.status}`);
  }

  return { key };
}

export function usePresignedUpload({ getUploadUrl }: PresignedUploadOpts) {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    completed: 0,
    total: 0,
    error: null,
  });

  const upload = useCallback(
    async (fileUri: string, mimeType: string): Promise<UploadResult | null> => {
      setState({ isUploading: true, completed: 0, total: 1, error: null });
      try {
        const result = await uploadOne(fileUri, mimeType, getUploadUrl);
        setState({ isUploading: false, completed: 1, total: 1, error: null });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setState({ isUploading: false, completed: 0, total: 1, error: message });
        return null;
      }
    },
    [getUploadUrl],
  );

  /**
   * Upload files to S3 and register each one via a callback, all in parallel.
   * Each file independently does: S3 upload → register callback.
   * If one file fails, others still succeed (no half-state).
   */
  const uploadAndRegister = useCallback(
    async <T>(
      files: { uri: string; mimeType: string }[],
      register: (key: string, index: number) => Promise<T>,
    ): Promise<UploadAndRegisterResult<T>> => {
      if (files.length === 0) return { succeeded: [], failed: 0 };

      setState({ isUploading: true, completed: 0, total: files.length, error: null });

      const results = await Promise.allSettled(
        files.map(async (file, idx) => {
          const { key } = await uploadOne(file.uri, file.mimeType, getUploadUrl);
          const registered = await register(key, idx);
          setState((prev) => ({ ...prev, completed: prev.completed + 1 }));
          return registered;
        }),
      );

      const succeeded: T[] = [];
      let failed = 0;

      for (const result of results) {
        if (result.status === "fulfilled") {
          succeeded.push(result.value);
        } else {
          failed++;
        }
      }

      setState({
        isUploading: false,
        completed: files.length,
        total: files.length,
        error: failed > 0 ? `${failed} of ${files.length} uploads failed` : null,
      });

      return { succeeded, failed };
    },
    [getUploadUrl],
  );

  return { upload, uploadAndRegister, ...state };
}
