import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppModal } from "@/components/ui/app-modal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { fonts, useTheme } from "@/styles";

export interface CardMenuItem {
  label: string;
  icon: string;
  color?: string;
  onPress: () => void;
}

interface CardMenuProps {
  items: CardMenuItem[];
  testIDPrefix?: string;
}

export function CardMenu({ items, testIDPrefix }: CardMenuProps) {
  const { colors: c } = useTheme();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<View>(null);
  const [triggerLayout, setTriggerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleOpen = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerLayout({ x, y, width, height });
      setOpen(true);
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <View ref={triggerRef} collapsable={false}>
      <Pressable
        style={[s.trigger, { borderColor: c.border, backgroundColor: c.bg }]}
        onPress={(event) => {
          event.stopPropagation();
          handleOpen();
        }}
        hitSlop={8}
        testID={testIDPrefix ? `${testIDPrefix}-menu` : undefined}
      >
        <IconSymbol name="line.horizontal.3" size={16} color={c.textSecondary} />
      </Pressable>

      {open ? (
        <AppModal transparent animationType="none" visible onRequestClose={() => setOpen(false)}>
          <Pressable style={s.backdrop} onPress={() => setOpen(false)}>
            <View
              style={[
                s.panel,
                {
                  borderColor: c.border,
                  backgroundColor: c.bg,
                  top: triggerLayout.y + triggerLayout.height + 6,
                  right: 16,
                },
              ]}
            >
              {items.map((item, index) => (
                <Pressable
                  key={item.label}
                  style={[
                    s.menuItem,
                    index < items.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: c.border,
                    },
                  ]}
                  onPress={() => {
                    setOpen(false);
                    item.onPress();
                  }}
                  testID={testIDPrefix ? `${testIDPrefix}-action-${index}` : undefined}
                >
                  <IconSymbol name={item.icon} size={14} color={item.color ?? c.danger} />
                  <Text style={[s.menuText, { color: item.color ?? c.danger }]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </AppModal>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  trigger: {
    height: 32,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
  },
  backdrop: {
    flex: 1,
  },
  panel: {
    position: "absolute",
    minWidth: 180,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
    elevation: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
  },
});
