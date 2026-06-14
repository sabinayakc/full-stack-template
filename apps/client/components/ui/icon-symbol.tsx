// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { SymbolWeight } from "expo-symbols";
import type { ComponentProps } from "react";
import type { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

type IconSymbolName = string;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.left": "chevron-left",
  "chevron.right": "chevron-right",
  "chevron.down": "keyboard-arrow-down",
  "chevron.up": "keyboard-arrow-up",
  "bubble.left.fill": "chat-bubble",
  "message.fill": "chat",
  "doc.text.fill": "description",
  "doc.text": "description",
  "doc.fill": "insert-drive-file",
  "doc.on.doc": "content-copy",
  "doc.on.doc.fill": "content-copy",
  "doc.plaintext": "description",
  "person.2.fill": "people",
  "person.3.fill": "groups",
  "person.circle": "account-circle",
  "person.circle.fill": "account-circle",
  "person.crop.circle": "account-circle",
  "person.crop.circle.fill": "account-circle",
  gearshape: "settings",
  "gearshape.fill": "settings",
  "gearshape.2": "settings-suggest",
  "gearshape.2.fill": "settings-suggest",
  "line.horizontal.3": "menu",
  "sidebar.left": "menu-open",
  "square.and.pencil": "edit-note",
  "square.and.arrow.down": "download",
  "square.grid.2x2.fill": "dashboard",
  "square.grid.3x3.topleft.filled": "grid-view",
  "trash.fill": "delete",
  trash: "delete-outline",
  "building.2.fill": "business",
  "building.fill": "business",
  checkmark: "check",
  circle: "radio-button-unchecked",
  "checkmark.circle": "check-circle",
  "checkmark.circle.fill": "check-circle",
  "checkmark.seal.fill": "verified",
  "chevron.up.chevron.down": "unfold-more",
  "xmark.circle.fill": "cancel",
  xmark: "close",
  plus: "add",
  "plus.circle.fill": "add-circle",
  "plus.square.on.square": "library-add",
  clock: "schedule",
  "clock.fill": "schedule",
  "arrow.down": "keyboard-arrow-down",
  "arrow.up": "keyboard-arrow-up",
  "arrow.right": "keyboard-arrow-right",
  "arrow.up.arrow.down": "swap-vert",
  "arrow.up.circle.fill": "upload",
  "arrow.up.right.square": "open-in-new",
  "arrow.down.doc.fill": "download",
  "doc.badge.arrow.up.fill": "upload-file",
  "arrow.right.square": "logout",
  "rectangle.portrait.and.arrow.right": "logout",
  "arrow.clockwise": "refresh",
  "arrow.triangle.2.circlepath": "sync",
  "arrow.uturn.left": "undo",
  calendar: "calendar-today",
  "calendar.badge.exclamationmark": "event-busy",
  magnifyingglass: "search",
  "dollarsign.circle.fill": "attach-money",
  "lock.fill": "lock",
  "lock.open.fill": "lock-open",
  "lock.shield.fill": "shield",
  "key.fill": "vpn-key",
  "checkmark.shield.fill": "verified-user",
  "shield.lefthalf.filled": "shield",
  signature: "draw",
  "paintbrush.fill": "palette",
  "shield.fill": "shield",
  "hand.raised.fill": "back-hand",
  "moon.fill": "dark-mode",
  "sun.max.fill": "light-mode",
  "circle.lefthalf.filled": "contrast",
  "puzzlepiece.extension.fill": "extension",
  "exclamationmark.triangle.fill": "warning",
  "exclamationmark.circle.fill": "error",
  "info.circle.fill": "info",
  link: "link",
  "info.circle": "info",
  "envelope.fill": "email",
  "phone.fill": "phone",
  "folder.fill": "folder",
  "bell.fill": "notifications",
  "bell.badge.fill": "notifications-active",
  "bell.slash.fill": "notifications-off",
  ellipsis: "more-horiz",
  pencil: "edit",
  "pencil.and.outline": "edit-note",
  photo: "photo",
  "photo.fill": "photo",
  "camera.fill": "photo-camera",
  "list.bullet": "format-list-bulleted",
  "wand.and.stars": "auto-fix-high",
  archivebox: "archive",
  "archivebox.fill": "archive",
  "questionmark.circle": "help-outline",
  "questionmark.circle.fill": "help",
  headphones: "headset",
  iphone: "smartphone",
  "tray.and.arrow.down.fill": "move-to-inbox",
  "tray.fill": "inbox",
  "calendar.badge.clock": "event",
  "hammer.fill": "construction",
  "person.badge.plus": "person-add",
  "location.fill": "location-on",
  "flag.fill": "flag",
  "megaphone.fill": "campaign",
  "person.fill": "person",
  "briefcase.fill": "work",
  "calendar.badge.plus": "event",
  "calendar.circle": "date-range",
  minus: "remove",
  paperclip: "attach-file",
  pin: "push-pin",
  "pin.fill": "push-pin",
  "pin.slash": "location-off",
  repeat: "repeat",
  "stop.fill": "stop",
  "slider.horizontal.3": "tune",
  "rectangle.3.group": "view-module",
  "rectangle.compress.vertical": "unfold-less",
  "rectangle.expand.vertical": "unfold-more",
  "rectangle.stack.fill": "layers",
  "tag.fill": "label",
  tag: "label",
  percent: "percent",
  "list.clipboard.fill": "fact-check",
  "list.clipboard": "fact-check",
  desktopcomputer: "desktop-windows",
  laptopcomputer: "laptop",
  ipad: "tablet-mac",
  "iphone.gen3": "smartphone",
  "ladybug.fill": "bug-report",
  "lightbulb.fill": "lightbulb",
  "lock.app.dashed": "lock-clock",
  "xmark.shield.fill": "gpp-bad",
  "wifi.slash": "wifi-off",
  "wrench.fill": "build",
  wrench: "build",
  "drop.fill": "water-drop",
  drop: "water-drop",
  "mountain.2.fill": "terrain",
  "mountain.2": "terrain",
  "square.grid.3x3.fill": "grid-on",
  "square.grid.3x3": "grid-on",
  "arrow.down.to.line": "vertical-align-bottom",
  "arrow.up.to.line": "vertical-align-top",
} as const satisfies Record<string, ComponentProps<typeof MaterialIcons>["name"]>;

const iconMapping = MAPPING as Record<string, ComponentProps<typeof MaterialIcons>["name"]>;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={iconMapping[name] ?? "help-outline"}
      style={style}
    />
  );
}
