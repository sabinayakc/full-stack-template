import { and, db, eq, sql } from "@repo/db";
import { member, organization } from "@repo/db/schema";
import type { DeletePreflightBlocker, DeletePreflightResult } from "@repo/shared";

export async function getOrgDeletePreflight(_orgId: string): Promise<DeletePreflightResult> {
  // No business entities block org deletion in the template. Add checks here
  // (e.g. open invoices, active projects) as the schema grows.
  return { canDelete: true, blockers: [] };
}

export async function getUserDeletePreflight(userId: string): Promise<DeletePreflightResult> {
  const ownedOrgs = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(and(eq(member.userId, userId), eq(member.role, "owner")));

  const blockers: DeletePreflightBlocker[] = [];
  for (const { organizationId: oid } of ownedOrgs) {
    const [ownerCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(member)
      .where(and(eq(member.organizationId, oid), eq(member.role, "owner")));
    if (Number(ownerCount?.count ?? 0) === 1) {
      const [org] = await db
        .select({ name: organization.name })
        .from(organization)
        .where(eq(organization.id, oid));
      if (org) {
        blockers.push({ label: `sole owner of "${org.name}"`, count: 1 });
      }
    }
  }

  return { canDelete: blockers.length === 0, blockers };
}
