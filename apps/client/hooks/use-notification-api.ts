import type { Notification } from "@repo/shared";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

interface NotificationListResponse {
  notifications: Notification[];
  nextCursor?: string;
}

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
  mine: () => [...notificationKeys.all, "mine"] as const,
  unreadCount: () => [...notificationKeys.all, "unread"] as const,
  detail: (id: string) => [...notificationKeys.all, "detail", id] as const,
};

export function useNotificationList(filters?: { channel?: string; status?: string }) {
  return useInfiniteQuery({
    queryKey: [...notificationKeys.list(), filters],
    queryFn: async ({ pageParam }): Promise<NotificationListResponse> => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam as string);
      if (filters?.channel) params.set("channel", filters.channel);
      if (filters?.status) params.set("status", filters.status);
      params.set("limit", "20");
      return fetchWithAuth(`/notifications?${params.toString()}`);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useMyNotifications(filters?: { type?: string }) {
  return useInfiniteQuery({
    queryKey: [...notificationKeys.mine(), filters],
    queryFn: async ({ pageParam }): Promise<NotificationListResponse> => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam as string);
      if (filters?.type) params.set("type", filters.type);
      params.set("limit", "20");
      return fetchWithAuth(`/notifications/mine?${params.toString()}`);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useUnreadCount() {
  const { activeOrganization } = useAuth();
  return useQuery<{ count: number }>({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => fetchWithAuth("/notifications/unread-count"),
    enabled: !!activeOrganization,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => fetchWithAuth(`/notifications/${id}/read`, { method: "PUT" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => fetchWithAuth("/notifications/mine/read-all", { method: "PUT" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useRegisterPushToken() {
  return useMutation({
    mutationFn: async (data: { token: string; platform: string }) =>
      fetchWithAuth("/notifications/push-token", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      recipientUserId?: string;
      recipientEmail?: string;
      recipientPhone?: string;
      channel: string;
      type?: string;
      subject?: string;
      body: string;
      projectId?: string;
    }) =>
      fetchWithAuth("/notifications", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
