export type UserRole = "admin" | "user";

export type OrganizationRole = "owner" | "admin" | "member";

export const ORGANIZATION_ROLES: OrganizationRole[] = ["owner", "admin", "member"];

export const ORGANIZATION_ROLE_LABELS: Record<OrganizationRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

/** Roles available when inviting new users (excludes owner) */
export const INVITABLE_ROLES: OrganizationRole[] = ["admin", "member"];

export type OrgType = "business" | "personal";

export type CompanySize = "solo" | "small" | "medium" | "large";

export interface UserProfileContact {
  displayName?: string;
  displayEmail?: string;
  displayPhone?: string;
  displayTitle?: string;
}

export type NotificationCategory = "general" | "marketing";

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = ["general", "marketing"];

export interface UserNotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  categories: Record<NotificationCategory, boolean>;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: UserNotificationPreferences = {
  push: true,
  email: true,
  sms: false,
  categories: {
    general: true,
    marketing: true,
  },
};

export interface UserMetadata {
  onboarded: boolean;
  onboardedAt?: string;
  jobTitle?: string;
  profileContact?: UserProfileContact;
  notificationPreferences?: UserNotificationPreferences;
}

export interface OrganizationOnboardingData {
  name: string;
  slug: string;
  orgType: OrgType;
  companySize?: CompanySize;
  phone?: string;
  website?: string;
}

export interface OnboardingData {
  organization: OrganizationOnboardingData;
  userPreferences: {
    jobTitle?: string;
  };
  invitations?: Array<{ email: string; role: string }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  phoneNumber: string | null;
  phoneNumberVerified: boolean;
  metadata: UserMetadata | Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Delete preflight types ──────────────────────────────────────────────────

export interface DeletePreflightBlocker {
  label: string;
  count: number;
}

export interface DeletePreflightResult {
  canDelete: boolean;
  blockers: DeletePreflightBlocker[];
}
