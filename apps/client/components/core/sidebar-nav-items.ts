import type { Resource } from "@repo/shared";
import type { Href } from "expo-router";

export type NavigationItem = {
  name: string;
  label: string;
  icon: string;
  route: Href;
  /** If set, only render when the user has read access to this resource. */
  requires?: Resource;
};

export const NAV_ITEMS: NavigationItem[] = [
  {
    name: "index",
    label: "Home",
    icon: "house.fill",
    route: "/(app)",
  },
  {
    name: "settings",
    label: "Settings",
    icon: "gearshape.fill",
    route: "/(app)/settings",
  },
];
