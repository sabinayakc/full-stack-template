import { z } from "zod";

export const orgTypeSchema = z.enum(["business", "personal"]);

export const companySizeSchema = z.enum(["solo", "small", "medium", "large"]);

export const organizationOnboardingSchema = z.object({
  name: z.string().trim().min(1, "Organization name is required").max(100),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with dashes"),
  orgType: orgTypeSchema.default("business"),
  companySize: companySizeSchema.optional(),
  phone: z.string().trim().max(20).optional(),
  website: z.string().trim().url("Must be a valid URL").max(200).optional().or(z.literal("")),
});

export const userPreferencesSchema = z.object({
  jobTitle: z.string().trim().max(100).optional(),
});

export const invitationItemSchema = z.object({
  email: z.string().trim().email("Must be a valid email"),
  role: z.enum(["admin", "member"]),
});

export const completeOnboardingSchema = z.object({
  organization: organizationOnboardingSchema,
  userPreferences: userPreferencesSchema,
  invitations: z.array(invitationItemSchema).max(10).optional(),
});

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;

export const completeInviteOnboardingSchema = z.object({
  userPreferences: userPreferencesSchema,
});

export type CompleteInviteOnboardingInput = z.infer<typeof completeInviteOnboardingSchema>;
