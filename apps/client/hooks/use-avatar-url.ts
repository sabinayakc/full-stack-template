import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { fetchWithAuth } from "@/lib/api";

export const avatarKeys = {
  user: ["avatar", "user"] as const,
};

export function useAvatarUrl() {
  const queryClient = useQueryClient();
  const { data, ...rest } = useQuery<{ url: string | null }>({
    queryKey: avatarKeys.user,
    queryFn: () => fetchWithAuth("/organizations/user/avatar-url"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: avatarKeys.user }),
    [queryClient],
  );

  return { avatarUrl: data?.url ?? null, invalidate, ...rest };
}
