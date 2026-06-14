import { z } from "zod";

export const organizationSettingsSchema = z.object({
  address: z.string().trim().max(500).optional(),
  phone: z.string().trim().max(50).optional(),
  email: z.string().trim().max(254).optional(),
  website: z.string().trim().max(500).optional(),
});

export const updateOrganizationSettingsSchema = organizationSettingsSchema;

export type OrganizationSettings = z.infer<typeof organizationSettingsSchema>;

export const organizationAdditionalFields = {
  metadata: {
    type: "json",
    required: false,
  },
  settings: {
    type: "json",
    required: false,
  },
} as const;

export const userAdditionalFields = {
  role: {
    type: "string",
    required: false,
    defaultValue: "user",
  },
  metadata: {
    type: "json",
    required: false,
    input: true,
  },
} as const;

export const organizationPluginSchema = {
  organization: {
    additionalFields: organizationAdditionalFields,
  },
} as const;

export function parseOrganizationSettings(value: unknown): OrganizationSettings {
  const parsed = organizationSettingsSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : {};
}
