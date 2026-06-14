import type { OrganizationRole, OrganizationSettings, UserMetadata } from "@repo/shared";
import { parseOrganizationSettings } from "@repo/shared";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authClient, useActiveOrganization, useSession as useBetterAuthSession } from "@/lib/auth";
import { useQueryReset } from "@/providers/query-provider";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
  phoneNumber: string | null;
  phoneNumberVerified: boolean;
  metadata: UserMetadata | null;
  twoFactorEnabled: boolean;
}

interface BetterAuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  role?: string;
  phoneNumber?: string | null;
  phoneNumberVerified?: boolean | null;
  metadata?: unknown;
  twoFactorEnabled?: boolean | null;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  metadata?: Record<string, unknown> | string | null;
  settings: OrganizationSettings;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  activeOrganization: Organization | null;
  activeMemberRole: OrganizationRole | null;
  isOrgLoading: boolean;
  setActiveOrganization: (orgId: string) => Promise<void>;
  refreshOrganization: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  activeOrganization: null,
  activeMemberRole: null,
  isOrgLoading: true,
  setActiveOrganization: async () => {},
  refreshOrganization: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function OrgAwareProvider({
  session,
  isPending,
  children,
}: {
  session: { user: BetterAuthUser } | null;
  isPending: boolean;
  children: React.ReactNode;
}) {
  const { data: activeOrg, isPending: isOrgPending } = useActiveOrganization();
  const [isSwitching, setIsSwitching] = useState(false);
  const [activeMemberRole, setActiveMemberRole] = useState<OrganizationRole | null>(null);
  const resetQueries = useQueryReset();

  // Reset switching flag once the active org query reflects the change.
  // This prevents a window where activeOrganization is null + isOrgLoading
  // is false, which would cause the auth gate to redirect back to /(org).
  useEffect(() => {
    if (isSwitching && activeOrg) {
      setIsSwitching(false);
    }
  }, [isSwitching, activeOrg]);

  useEffect(() => {
    const orgId = activeOrg?.id;
    const userId = session?.user?.id;
    if (!orgId || !userId) {
      setActiveMemberRole(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await authClient.organization.listMembers({
          query: { organizationId: orgId, limit: 100, offset: 0 },
        });
        if (cancelled || !data) return;
        const members = data as
          | Array<{ userId?: string; role?: string }>
          | { members: Array<{ userId?: string; role?: string }> };
        const list = Array.isArray(members) ? members : members.members;
        const me = list.find((m) => m.userId === userId);
        setActiveMemberRole((me?.role as OrganizationRole) ?? null);
      } catch {
        if (!cancelled) setActiveMemberRole(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeOrg?.id, session?.user?.id]);

  const setActiveOrganization = useCallback(
    async (orgId: string) => {
      setIsSwitching(true);
      try {
        await authClient.organization.setActive({ organizationId: orgId });
        resetQueries();
      } catch {
        setIsSwitching(false);
        throw new Error("Failed to set active organization");
      }
    },
    [resetQueries],
  );

  const refreshOrganization = useCallback(async () => {
    if (activeOrg?.id) {
      await authClient.organization.setActive({ organizationId: activeOrg.id });
    }
  }, [activeOrg?.id]);

  const value: AuthContextValue = {
    user: session?.user
      ? {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          emailVerified: session.user.emailVerified ?? false,
          role: session.user.role ?? "estimator",
          phoneNumber: session.user.phoneNumber ?? null,
          phoneNumberVerified: session.user.phoneNumberVerified ?? false,
          metadata: (session.user.metadata as UserMetadata) ?? null,
          twoFactorEnabled: session.user.twoFactorEnabled ?? false,
        }
      : null,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    activeOrganization: activeOrg
      ? {
          id: activeOrg.id,
          name: activeOrg.name,
          slug: activeOrg.slug,
          logo: activeOrg.logo,
          metadata:
            (activeOrg as { metadata?: Record<string, unknown> | string | null }).metadata ?? null,
          settings: parseOrganizationSettings((activeOrg as { settings?: unknown }).settings),
        }
      : null,
    activeMemberRole,
    isOrgLoading: isOrgPending || isSwitching,
    setActiveOrganization,
    refreshOrganization,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function UnauthenticatedProvider({
  isPending,
  children,
}: {
  isPending: boolean;
  children: React.ReactNode;
}) {
  const value: AuthContextValue = {
    user: null,
    isLoading: isPending,
    isAuthenticated: false,
    activeOrganization: null,
    activeMemberRole: null,
    isOrgLoading: false,
    setActiveOrganization: async () => {},
    refreshOrganization: async () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useBetterAuthSession();
  const isAuthenticated = !!session?.user;

  if (!isAuthenticated) {
    return <UnauthenticatedProvider isPending={isPending}>{children}</UnauthenticatedProvider>;
  }

  return (
    <OrgAwareProvider session={session} isPending={isPending}>
      {children}
    </OrgAwareProvider>
  );
}
