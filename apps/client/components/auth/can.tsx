import type { Action, Resource } from "@repo/shared";
import type { ReactNode } from "react";
import { usePermission } from "@/hooks/use-permission";

interface CanProps {
  resource: Resource;
  action: Action;
  /** Optional content to render when the user lacks permission. Defaults to nothing. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Renders `children` only when the current user can perform `action` on
 * `resource`. Use this to gate write actions (Create/Edit/Delete buttons,
 * menu items, etc.) so non-permitted roles never see them.
 *
 * @example
 *   <Can resource="customer" action="create">
 *     <Button onPress={...}>Add Customer</Button>
 *   </Can>
 */
export function Can({ resource, action, fallback = null, children }: CanProps) {
  const { can } = usePermission();
  return <>{can(resource, action) ? children : fallback}</>;
}
