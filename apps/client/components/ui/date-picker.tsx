import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { AppModal } from "@/components/ui/app-modal";
import { FormField } from "@/components/ui/form-field";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { haptic } from "@/lib/haptics";
import { fonts, radius, spacing, useTheme } from "@/styles";

// ── Types ──────────────────────────────────────────────────────────

type DatePickerMode = "date" | "time" | "datetime";

type DatePickerProps = {
  value?: Date;
  onChange: (date: Date) => void;
  mode?: DatePickerMode;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  minuteInterval?: 1 | 5 | 10 | 15 | 30;
  containerStyle?: ViewStyle;
};

// ── Constants ──────────────────────────────────────────────────────

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ── Helpers ────────────────────────────────────────────────────────

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatDate(date: Date) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatTime(date: Date) {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${pad(m)} ${ampm}`;
}

function formatDateTime(date: Date, mode: DatePickerMode) {
  if (mode === "date") return formatDate(date);
  if (mode === "time") return formatTime(date);
  return `${formatDate(date)} at ${formatTime(date)}`;
}

function range(start: number, end: number): number[] {
  const arr: number[] = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

// ── Scroll Wheel ───────────────────────────────────────────────────

type WheelColumn<T> = {
  data: T[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  renderLabel: (item: T) => string;
  width: number;
};

function WheelColumn<T>({ data, selectedIndex, onSelect, renderLabel, width }: WheelColumn<T>) {
  const { colors: c } = useTheme();
  const listRef = useRef<FlatList>(null);
  const isUserScrolling = useRef(false);

  // Pad data with empty items for centering
  const paddedData = useMemo(() => {
    const padding = Math.floor(VISIBLE_ITEMS / 2);
    const top = Array.from({ length: padding }, (_, i) => ({ key: `top-${i}`, empty: true }));
    const bottom = Array.from({ length: padding }, (_, i) => ({ key: `bot-${i}`, empty: true }));
    const items = data.map((item, i) => ({
      key: `item-${i}`,
      empty: false,
      value: item,
      index: i,
    }));
    return [...top, ...items, ...bottom];
  }, [data]);

  // Scroll to selected when it changes externally
  useEffect(() => {
    if (!isUserScrolling.current && listRef.current) {
      listRef.current.scrollToOffset({
        offset: selectedIndex * ITEM_HEIGHT,
        animated: true,
      });
    }
  }, [selectedIndex]);

  const handleMomentumEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      const y = e.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(index, data.length - 1));
      isUserScrolling.current = false;
      if (clamped !== selectedIndex) {
        haptic.selection();
        onSelect(clamped);
      }
    },
    [data.length, selectedIndex, onSelect],
  );

  return (
    <View style={[s.wheelColumn, { width, height: WHEEL_HEIGHT }]}>
      {/* Selection highlight */}
      <View
        style={[s.selectionHighlight, { backgroundColor: c.primarySubtle, borderColor: c.border }]}
        pointerEvents="none"
      />
      <FlatList
        ref={listRef}
        data={paddedData}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScrollBeginDrag={() => {
          isUserScrolling.current = true;
        }}
        onMomentumScrollEnd={handleMomentumEnd}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        renderItem={({ item }) => {
          if (item.empty) {
            return <View style={s.wheelItem} />;
          }
          const isSelected = item.index === selectedIndex;
          return (
            <Pressable
              style={s.wheelItem}
              onPress={() => {
                haptic.selection();
                onSelect(item.index);
              }}
            >
              <Text
                style={[
                  s.wheelText,
                  {
                    color: isSelected ? c.primary : c.textSecondary,
                    fontFamily: isSelected ? fonts.semibold : fonts.regular,
                    opacity: isSelected ? 1 : 0.6,
                  },
                ]}
                numberOfLines={1}
              >
                {renderLabel(item.value as T)}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

// ── Tab Switcher (for datetime mode) ───────────────────────────────

function TabSwitcher({
  active,
  onSwitch,
}: {
  active: "date" | "time";
  onSwitch: (tab: "date" | "time") => void;
}) {
  const { colors: c } = useTheme();
  const indicatorX = useSharedValue(active === "date" ? 0 : 1);

  useEffect(() => {
    indicatorX.value = withTiming(active === "date" ? 0 : 1, { duration: 200 });
  }, [active, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: `${indicatorX.value * 50}%` as unknown as number,
  }));

  return (
    <View style={[s.tabRow, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Animated.View style={[s.tabIndicator, { backgroundColor: c.bg }, indicatorStyle]} />
      <Pressable
        style={s.tab}
        onPress={() => {
          haptic.light();
          onSwitch("date");
        }}
      >
        <IconSymbol
          name="calendar"
          size={16}
          color={active === "date" ? c.primary : c.textSecondary}
        />
        <Text
          style={[
            s.tabText,
            {
              color: active === "date" ? c.primary : c.textSecondary,
              fontFamily: active === "date" ? fonts.semibold : fonts.regular,
            },
          ]}
        >
          Date
        </Text>
      </Pressable>
      <Pressable
        style={s.tab}
        onPress={() => {
          haptic.light();
          onSwitch("time");
        }}
      >
        <IconSymbol
          name="clock"
          size={16}
          color={active === "time" ? c.primary : c.textSecondary}
        />
        <Text
          style={[
            s.tabText,
            {
              color: active === "time" ? c.primary : c.textSecondary,
              fontFamily: active === "time" ? fonts.semibold : fonts.regular,
            },
          ]}
        >
          Time
        </Text>
      </Pressable>
    </View>
  );
}

// ── Date Wheels ────────────────────────────────────────────────────

function DateWheels({
  year,
  month,
  day,
  onChangeYear,
  onChangeMonth,
  onChangeDay,
  minDate,
  maxDate,
}: {
  year: number;
  month: number;
  day: number;
  onChangeYear: (y: number) => void;
  onChangeMonth: (m: number) => void;
  onChangeDay: (d: number) => void;
  minDate?: Date;
  maxDate?: Date;
}) {
  const minYear = minDate ? minDate.getFullYear() : 2000;
  const maxYear = maxDate ? maxDate.getFullYear() : 2050;
  const years = useMemo(() => range(minYear, maxYear), [minYear, maxYear]);

  const months = useMemo(() => {
    let start = 0;
    let end = 11;
    if (minDate && year === minDate.getFullYear()) start = minDate.getMonth();
    if (maxDate && year === maxDate.getFullYear()) end = maxDate.getMonth();
    return range(start, end);
  }, [year, minDate, maxDate]);

  const days = useMemo(() => {
    const maxDayInMonth = daysInMonth(year, month);
    let start = 1;
    let end = maxDayInMonth;
    if (minDate && year === minDate.getFullYear() && month === minDate.getMonth()) {
      start = minDate.getDate();
    }
    if (maxDate && year === maxDate.getFullYear() && month === maxDate.getMonth()) {
      end = Math.min(end, maxDate.getDate());
    }
    return range(start, end);
  }, [year, month, minDate, maxDate]);

  // Clamp month if out of range
  useEffect(() => {
    if (!months.includes(month)) onChangeMonth(months[0]);
  }, [month, months, onChangeMonth]);

  // Clamp day if out of range
  useEffect(() => {
    if (!days.includes(day)) onChangeDay(days[0]);
  }, [day, days, onChangeDay]);

  return (
    <View style={s.wheelsRow}>
      <WheelColumn
        data={months}
        selectedIndex={months.indexOf(month)}
        onSelect={(i) => onChangeMonth(months[i])}
        renderLabel={(m) => MONTHS[m]}
        width={120}
      />
      <WheelColumn
        data={days}
        selectedIndex={days.indexOf(day)}
        onSelect={(i) => onChangeDay(days[i])}
        renderLabel={(d) => `${d}`}
        width={60}
      />
      <WheelColumn
        data={years}
        selectedIndex={years.indexOf(year)}
        onSelect={(i) => onChangeYear(years[i])}
        renderLabel={(y) => `${y}`}
        width={80}
      />
    </View>
  );
}

// ── Time Wheels ────────────────────────────────────────────────────

function TimeWheels({
  hours,
  minutes,
  onChangeHours,
  onChangeMinutes,
  minuteInterval = 1,
}: {
  hours: number;
  minutes: number;
  onChangeHours: (h: number) => void;
  onChangeMinutes: (m: number) => void;
  minuteInterval?: number;
}) {
  const hourValues = useMemo(() => range(1, 12), []);
  const minuteValues = useMemo(() => {
    const vals: number[] = [];
    for (let i = 0; i < 60; i += minuteInterval) vals.push(i);
    return vals;
  }, [minuteInterval]);
  const periods = useMemo(() => ["AM", "PM"] as const, []);

  const isPM = hours >= 12;
  const h12 = hours % 12 || 12;

  // Snap minutes to nearest interval
  const snapMinute = minuteValues.reduce((prev, curr) =>
    Math.abs(curr - minutes) < Math.abs(prev - minutes) ? curr : prev,
  );

  return (
    <View style={s.wheelsRow}>
      <WheelColumn
        data={hourValues}
        selectedIndex={hourValues.indexOf(h12)}
        onSelect={(i) => {
          const newH12 = hourValues[i];
          onChangeHours(isPM ? (newH12 % 12) + 12 : newH12 % 12);
        }}
        renderLabel={(h) => `${h}`}
        width={60}
      />
      <WheelColumn
        data={minuteValues}
        selectedIndex={minuteValues.indexOf(snapMinute)}
        onSelect={(i) => onChangeMinutes(minuteValues[i])}
        renderLabel={(m) => pad(m)}
        width={60}
      />
      <WheelColumn
        data={[...periods]}
        selectedIndex={isPM ? 1 : 0}
        onSelect={(i) => {
          const newIsPM = i === 1;
          const h12Val = hours % 12;
          onChangeHours(newIsPM ? h12Val + 12 : h12Val);
        }}
        renderLabel={(p) => p}
        width={60}
      />
    </View>
  );
}

// ── Main Component ─────────────────────────────────────────────────

export function DatePicker({
  value,
  onChange,
  mode = "date",
  label,
  hint,
  error,
  placeholder,
  minDate,
  maxDate,
  minuteInterval = 1,
  containerStyle,
}: DatePickerProps) {
  const { colors: c } = useTheme();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"date" | "time">("date");

  // Draft state while picker is open
  const [draft, setDraft] = useState(() => value ?? new Date());

  const openPicker = useCallback(() => {
    setDraft(value ?? new Date());
    setActiveTab("date");
    haptic.light();
    setOpen(true);
  }, [value]);

  const handleConfirm = useCallback(() => {
    haptic.success();
    onChange(draft);
    setOpen(false);
  }, [draft, onChange]);

  const handleCancel = useCallback(() => {
    haptic.light();
    setOpen(false);
  }, []);

  // Draft updaters
  const setYear = useCallback(
    (y: number) =>
      setDraft((d) => {
        const next = new Date(d);
        next.setFullYear(y);
        return next;
      }),
    [],
  );

  const setMonth = useCallback(
    (m: number) =>
      setDraft((d) => {
        const next = new Date(d);
        next.setMonth(m);
        // Clamp day
        const maxDay = daysInMonth(next.getFullYear(), m);
        if (next.getDate() > maxDay) next.setDate(maxDay);
        return next;
      }),
    [],
  );

  const setDay = useCallback(
    (day: number) =>
      setDraft((d) => {
        const next = new Date(d);
        next.setDate(day);
        return next;
      }),
    [],
  );

  const setHours = useCallback(
    (h: number) =>
      setDraft((d) => {
        const next = new Date(d);
        next.setHours(h);
        return next;
      }),
    [],
  );

  const setMinutes = useCallback(
    (m: number) =>
      setDraft((d) => {
        const next = new Date(d);
        next.setMinutes(m);
        return next;
      }),
    [],
  );

  // Display text
  const displayText = value ? formatDateTime(value, mode) : undefined;
  const defaultPlaceholder =
    mode === "date" ? "Select date" : mode === "time" ? "Select time" : "Select date & time";

  // Animated opacity for trigger press
  const triggerOpacity = useSharedValue(1);
  const triggerAnimStyle = useAnimatedStyle(() => ({
    opacity: triggerOpacity.value,
  }));

  const showDateWheels = mode === "date" || (mode === "datetime" && activeTab === "date");
  const showTimeWheels = mode === "time" || (mode === "datetime" && activeTab === "time");

  return (
    <>
      <FormField label={label} hint={hint} error={error} style={containerStyle}>
        <Pressable
          onPressIn={() => {
            triggerOpacity.value = withTiming(0.7, { duration: 80 });
          }}
          onPressOut={() => {
            triggerOpacity.value = withTiming(1, { duration: 150 });
          }}
          onPress={openPicker}
        >
          <Animated.View
            style={[
              s.trigger,
              {
                backgroundColor: c.bg,
                borderColor: error ? c.danger : c.border,
              },
              error ? { backgroundColor: `${c.danger}0D` } : null,
              triggerAnimStyle,
            ]}
          >
            <IconSymbol
              name={mode === "time" ? "clock" : "calendar"}
              size={18}
              color={displayText ? c.primary : c.textSecondary}
            />
            <Text
              style={[s.triggerText, { color: displayText ? c.text : c.textSecondary }]}
              numberOfLines={1}
            >
              {displayText ?? placeholder ?? defaultPlaceholder}
            </Text>
            <IconSymbol name="chevron.down" size={14} color={c.textSecondary} />
          </Animated.View>
        </Pressable>
      </FormField>

      <AppModal visible={open} transparent statusBarTranslucent animationType="fade">
        <View style={s.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} />

          <View style={[s.sheet, { backgroundColor: c.bg, borderColor: c.border }]}>
            {/* Header */}
            <View style={[s.sheetHeader, { borderBottomColor: c.border }]}>
              <Pressable onPress={handleCancel} hitSlop={8}>
                <Text style={[s.headerBtn, { color: c.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Text style={[s.headerTitle, { color: c.text }]}>
                {mode === "date"
                  ? "Select Date"
                  : mode === "time"
                    ? "Select Time"
                    : "Select Date & Time"}
              </Text>
              <Pressable onPress={handleConfirm} hitSlop={8}>
                <Text style={[s.headerBtn, s.headerBtnConfirm, { color: c.primary }]}>Done</Text>
              </Pressable>
            </View>

            {/* Tab switcher for datetime */}
            {mode === "datetime" ? (
              <TabSwitcher active={activeTab} onSwitch={setActiveTab} />
            ) : null}

            {/* Preview */}
            <Text style={[s.preview, { color: c.primary }]}>{formatDateTime(draft, mode)}</Text>

            {/* Wheels */}
            <View style={s.wheelsContainer}>
              {showDateWheels ? (
                <DateWheels
                  year={draft.getFullYear()}
                  month={draft.getMonth()}
                  day={draft.getDate()}
                  onChangeYear={setYear}
                  onChangeMonth={setMonth}
                  onChangeDay={setDay}
                  minDate={minDate}
                  maxDate={maxDate}
                />
              ) : null}
              {showTimeWheels ? (
                <TimeWheels
                  hours={draft.getHours()}
                  minutes={draft.getMinutes()}
                  onChangeHours={setHours}
                  onChangeMinutes={setMinutes}
                  minuteInterval={minuteInterval}
                />
              ) : null}
            </View>
          </View>
        </View>
      </AppModal>
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Trigger
  trigger: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.regular,
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingBottom: 34, // safe area
    overflow: "hidden",
    ...(Platform.OS === "web"
      ? { maxWidth: 420, width: "100%", alignSelf: "center" as const }
      : {}),
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fonts.semibold,
  },
  headerBtn: {
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  headerBtnConfirm: {
    fontFamily: fonts.semibold,
  },

  // Tabs
  tabRow: {
    flexDirection: "row",
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 40,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    zIndex: 1,
  },
  tabIndicator: {
    position: "absolute",
    top: 2,
    bottom: 2,
    width: "48%",
    borderRadius: radius.sm,
    marginHorizontal: 2,
    zIndex: 0,
  },
  tabText: {
    fontSize: 14,
  },

  // Preview
  preview: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: fonts.semibold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  // Wheels
  wheelsContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  wheelsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
  wheelColumn: {
    overflow: "hidden",
  },
  selectionHighlight: {
    position: "absolute",
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderRadius: radius.md,
    borderWidth: 1,
    zIndex: 0,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  wheelText: {
    fontSize: 18,
  },
});
