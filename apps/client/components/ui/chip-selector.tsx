import { Pressable, StyleSheet, Text, View } from "react-native";
import { fonts, useTheme } from "@/styles";

interface SingleChipSelectorProps<T extends string> {
  items: readonly T[];
  selectedValue: T;
  onSelect: (item: T) => void;
  renderLabel?: (item: T) => string;
  testIDPrefix?: string;
  multi?: false;
}

interface MultiChipSelectorProps<T extends string> {
  items: readonly T[];
  selectedValues: T[];
  onToggle: (item: T) => void;
  renderLabel?: (item: T) => string;
  testIDPrefix?: string;
  multi: true;
}

type ChipSelectorProps<T extends string> = SingleChipSelectorProps<T> | MultiChipSelectorProps<T>;

export function ChipSelector<T extends string>(props: ChipSelectorProps<T>) {
  const { colors: c } = useTheme();
  const { items, renderLabel, testIDPrefix } = props;

  return (
    <View style={s.row}>
      {items.map((item) => {
        const isSelected = props.multi
          ? props.selectedValues.includes(item)
          : props.selectedValue === item;
        return (
          <Pressable
            key={item}
            style={[
              s.chip,
              isSelected
                ? { backgroundColor: c.primary }
                : { borderWidth: 1, borderColor: c.border, backgroundColor: c.bgSecondary },
            ]}
            onPress={() => (props.multi ? props.onToggle(item) : props.onSelect(item))}
            testID={testIDPrefix ? `${testIDPrefix}-${item}` : undefined}
          >
            <Text style={[s.chipText, { color: isSelected ? "#fff" : c.textSecondary }]}>
              {renderLabel ? renderLabel(item) : item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 9999,
    minHeight: 36,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    textTransform: "capitalize",
  },
});
