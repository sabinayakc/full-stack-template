import { type Action, can, type Resource } from "@repo/shared";
import { useCallback } from "react";
import { useAuth } from "@/providers/auth-provider";

/**
 * Returns helpers for checking what the current user can do, driven by the
 * shared `ROLE_PERMISSIONS` map. Add a new resource/action there and every
 * `<Can>` and `usePermission()` call updates automatically.
 */
export function usePermission() {
  const { activeMemberRole } = useAuth();
  const role = activeMemberRole;

  const check = useCallback(
    (resource: Resource, action: Action) => can(role, resource, action),
    [role],
  );

  return { can: check, role };
}
