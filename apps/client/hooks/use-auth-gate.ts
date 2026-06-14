import { useLocalSearchParams, usePathname, useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { useAuth } from "@/providers/auth-provider";

const DEBUG = __DEV__;

// && process.env.EXPO_PUBLIC_AUTH_GATE_LOG === "1";

function log(action: string, details?: Record<string, unknown>) {
  if (!DEBUG) return;
  const extra = details ? ` ${JSON.stringify(details)}` : "";
  console.log(`[AuthGate] ${action}${extra}`);
}

function groupFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/\(([^)]+)\)/);
  return match ? `(${match[1]})` : undefined;
}

/**
 * Auth routes that must remain accessible even when the user already has a
 * session — e.g. tapping a reset-password or verify-email link from another
 * device. Bouncing these to /(app) caused a brief splash → loading → form
 * → splash flash; allowing them to render avoids that.
 */
const SESSION_AGNOSTIC_AUTH_PATHS = new Set<string>([
  "/(auth)/reset-password",
  "/(auth)/verify-email",
  "/(auth)/forgot-password",
]);

export function useAuthGate(fontsLoaded: boolean) {
  const { isAuthenticated, isLoading, activeOrganization, isOrgLoading } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const params = useLocalSearchParams<{ redirect?: string }>();
  const lastRedirect = useRef<string | null>(null);
  const hasBeenReady = useRef(false);

  // Once ready, stay ready — background session refetches (e.g. tab focus)
  // must not flip isReady back to false, which would unmount the current screen.
  if (fontsLoaded && !isLoading) {
    hasBeenReady.current = true;
  }
  const isReady = hasBeenReady.current;

  useEffect(() => {
    if (!isReady) {
      log("not ready");
      return;
    }

    const group = groupFromPath(pathname) ?? (segments[0] as string | undefined);
    const hasOrg = !!activeOrganization;

    log("evaluate", { isAuthenticated, hasOrg, isOrgLoading, group, pathname });

    if (!group) {
      log("segments not ready, skipping");
      return;
    }

    let target: string | null = null;

    if (!isAuthenticated) {
      if (group !== "(auth)" && group !== "(public)" && group !== "(portal)") {
        const search =
          typeof window !== "undefined" && window.location ? window.location.search : "";
        const redirectUrl = encodeURIComponent(pathname + search);
        target = `/(auth)/sign-in?redirect=${redirectUrl}`;
      }
    } else if (group === "(auth)" && !SESSION_AGNOSTIC_AUTH_PATHS.has(pathname)) {
      // Wait for org status to settle before deciding where to go.
      // Stale cache from a previous session can briefly look like hasOrg=true.
      if (isOrgLoading) {
        log("waiting for org status");
        return;
      }
      if (params.redirect) {
        target = decodeURIComponent(params.redirect);
      } else {
        target = hasOrg ? "/(app)" : "/(org)/org";
      }
    } else if (!hasOrg && !isOrgLoading) {
      if (group !== "(org)" && group !== "(public)" && group !== "(portal)" && group !== "(auth)") {
        target = "/(org)/org";
      }
    }
    // When hasOrg && group === "(org)": no redirect — user explicitly navigated
    // to org selection/creation. The (org) screens navigate to (app) after completion.

    if (!target) {
      log("no redirect needed");
      lastRedirect.current = null;
      return;
    }

    if (lastRedirect.current === target) {
      log("skipping duplicate redirect", { target });
      return;
    }

    log("redirect", { from: group, to: target });
    lastRedirect.current = target;
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic routing
    router.replace(target as any);
  }, [
    isAuthenticated,
    isReady,
    activeOrganization,
    isOrgLoading,
    segments,
    pathname,
    params.redirect,
    router,
  ]);

  return { isReady };
}
