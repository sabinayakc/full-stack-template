import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useWebLayout } from "@/hooks/use-web-layout";

export const SIDEBAR_WIDTH_EXPANDED = 260;
export const SIDEBAR_WIDTH_COLLAPSED = 68;

type SidebarContextValue = {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  isMobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  sidebarWidth: number;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

function readPersistedCollapsed(): boolean {
  try {
    return localStorage.getItem("sidebar_collapsed") === "true";
  } catch {
    return false;
  }
}

function persistCollapsed(value: boolean) {
  try {
    localStorage.setItem("sidebar_collapsed", String(value));
  } catch {}
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const { isMobile, isTablet } = useWebLayout();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (isMobile) return true;
    if (isTablet) return true;
    return readPersistedCollapsed();
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auto-close mobile overlay when resizing above mobile breakpoint
  useEffect(() => {
    if (!isMobile) setIsMobileOpen(false);
  }, [isMobile]);

  // Auto-collapse on tablet, auto-expand on desktop (unless user explicitly collapsed)
  useEffect(() => {
    if (isTablet) setIsCollapsed(true);
  }, [isTablet]);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      persistCollapsed(next);
      return next;
    });
  }, []);

  const openMobile = useCallback(() => setIsMobileOpen(true), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  const sidebarWidth = isMobile
    ? 0
    : isCollapsed
      ? SIDEBAR_WIDTH_COLLAPSED
      : SIDEBAR_WIDTH_EXPANDED;

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, toggleCollapsed, isMobileOpen, openMobile, closeMobile, sidebarWidth }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
