import { relations } from "drizzle-orm";
import { boolean, index, pgEnum, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { defaultTimeStampFields, encryptedJsonb, timestamptz } from "./base";

export const smsAccountStatusEnum = pgEnum("sms_account_status", [
  "onboarding",
  "active",
  "suspended",
  "disabled",
]);

export interface SmsAccountCredentials {
  accountSid: string;
  authToken: string;
}

export const smsAccount = pgTable(
  "sms_account",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    externalAccountSid: text("external_account_sid").notNull(),
    credentials: encryptedJsonb("credentials"),
    fromNumber: text("from_number"),
    messagingServiceSid: text("messaging_service_sid"),
    status: smsAccountStatusEnum("status").default("onboarding").notNull(),
    smsEnabled: boolean("sms_enabled").default(true).notNull(),
    lastValidatedAt: timestamptz("last_validated_at"),
    ...defaultTimeStampFields,
  },
  (table) => [
    uniqueIndex("smsAccount_organizationId_uidx").on(table.organizationId),
    index("smsAccount_provider_idx").on(table.provider),
    index("smsAccount_status_idx").on(table.status),
  ],
);

export const smsAccountRelations = relations(smsAccount, ({ one }) => ({
  organization: one(organization, {
    fields: [smsAccount.organizationId],
    references: [organization.id],
  }),
}));
