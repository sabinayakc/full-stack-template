import { and, eq } from "@repo/db";
import { db } from "@repo/db/client";
import { member, organization } from "@repo/db/schema";
import { organizationSettingsSchema, parseOrganizationSettings } from "@repo/shared";

export const organizationService = {
  async getById(id: string) {
    const [row] = await db.select().from(organization).where(eq(organization.id, id));
    return row ?? null;
  },

  async getBySlug(slug: string) {
    const [row] = await db
      .select({ id: organization.id })
      .from(organization)
      .where(eq(organization.slug, slug));
    return row ?? null;
  },

  async getSettings(orgId: string) {
    const [row] = await db
      .select({ settings: organization.settings })
      .from(organization)
      .where(eq(organization.id, orgId));

    if (!row) return null;
    return parseOrganizationSettings(row.settings);
  },

  async updateSettings(orgId: string, body: Record<string, unknown>) {
    const current = await this.getSettings(orgId);
    if (!current) return { error: "Organization not found" as const };

    const merged = {
      ...current,
      ...body,
    };

    const result = organizationSettingsSchema.safeParse(merged);
    if (!result.success) {
      return { error: result.error.issues[0]?.message ?? "Invalid settings" };
    }

    await db.update(organization).set({ settings: result.data }).where(eq(organization.id, orgId));

    return { settings: result.data };
  },

  async getOrgContext(orgId: string) {
    const [row] = await db
      .select({
        name: organization.name,
        metadata: organization.metadata,
        settings: organization.settings,
      })
      .from(organization)
      .where(eq(organization.id, orgId));

    return row ?? null;
  },

  async getMemberRole(userId: string, organizationId: string) {
    const [row] = await db
      .select({ role: member.role })
      .from(member)
      .where(and(eq(member.userId, userId), eq(member.organizationId, organizationId)));

    return row?.role ?? undefined;
  },
};
