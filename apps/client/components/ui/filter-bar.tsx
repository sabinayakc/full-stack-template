import type React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { fonts, useTheme } from "@/styles";

interface FilterBarProps<T extends string> {
  filters: readonly T[];
  activeFilter: T;
  onFilterChange: (filter: T) => void;
  renderLabel?: (filter: T) => string;
  extra?: React.ReactNode;
  bare?: boolean;
}

export function FilterBar<T extends string>({
  filters,
  activeFilter,
  onFilterChange,
  renderLabel,
  extra,
  bare,
}: FilterBarProps<T>) {
  const { colors: c } = useTheme();

  return (
    <View style={[bare ? s.filterBarBare : s.filterBar, !bare && { borderBottomColor: c.border }]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.filterContent}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {filters.map((filter) => (
          <Pressable
            key={filter}
            style={[
              s.filterChip,
              activeFilter === filter
                ? { backgroundColor: c.primary }
                : { borderWidth: 1, borderColor: c.border, backgroundColor: c.bgSecondary },
            ]}
            onPress={() => onFilterChange(filter)}
          >
            <Text
              style={[
                s.filterChipText,
                { color: activeFilter === filter ? "#ffffff" : c.textSecondary },
              ]}
            >
              {renderLabel ? renderLabel(filter) : filter}
            </Text>
          </Pressable>
        ))}
        {extra}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  filterBar: {
    marginTop: 8,
  },
  filterBarBare: {
    flex: 1,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  filterChip: {
    borderRadius: 9999,
    minHeight: 36,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    textTransform: "capitalize",
  },
});
