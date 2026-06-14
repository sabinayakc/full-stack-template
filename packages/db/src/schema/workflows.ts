import { relations } from "drizzle-orm";
import { index, jsonb, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { defaultTimeStampFields } from "./base";

export const workflowRunStatusEnum = pgEnum("workflow_run_status", [
  "pending",
  "running",
  "success",
  "failed",
  "cancelled",
]);

export const workflowRun = pgTable(
  "workflow_run",
  {
    id: uuid("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    status: workflowRunStatusEnum("status").default("pending").notNull(),
    workflowDefinitionId: text("workflow_definition_id").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>(),
    ...defaultTimeStampFields,
  },
  (table) => [
    index("workflowRun_organizationId_idx").on(table.organizationId),
    index("workflowRun_status_idx").on(table.status),
  ],
);

export const workflowRunRelations = relations(workflowRun, ({ one }) => ({
  organization: one(organization, {
    fields: [workflowRun.organizationId],
    references: [organization.id],
  }),
}));
