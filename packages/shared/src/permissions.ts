import type { OrganizationRole } from "./types/user";

/**
 * Resources are top-level domain objects. Adding a new resource only
 * requires a new key here and entries in the role map below; UI gates
 * will pick it up automatically via `can()`.
 */
export const RESOURCES = ["settings", "billing"] as const;

export type Resource = (typeof RESOURCES)[number];

export const ACTIONS = ["create", "read", "update", "delete", "manage"] as const;
export type Action = (typeof ACTIONS)[number];

export type RolePermissions = Record<Resource, readonly Action[]>;

/**
 * Single source of truth for what each role can do. Mirrors the Better Auth
 * access-control roles defined in apps/server/src/auth/permissions.ts and is
 * also consumed by client UI gating via `can()`.
 */
export const ROLE_PERMISSIONS: Record<OrganizationRole, RolePermissions> = {
  owner: {
    settings: ["read", "update"],
    billing: ["read", "manage"],
  },
  admin: {
    settings: ["read", "update"],
    billing: ["read", "manage"],
  },
  member: {
    settings: ["read"],
    billing: ["read"],
  },
};

/**
 * Does the given role have permission to perform `action` on `resource`?
 * Pure function — every UI gate and server check should route through this
 * so changes to the role map propagate everywhere.
 *
 * Defaults to `false` for unknown roles so unauthenticated callers can't
 * sneak through.
 */
export function can(
  role: OrganizationRole | undefined | null,
  resource: Resource,
  action: Action,
): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms[resource]?.includes(action) ?? false;
}
