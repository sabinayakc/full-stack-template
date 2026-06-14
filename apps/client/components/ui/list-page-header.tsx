import type React from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated from "react-native-reanimated";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { useCollapsibleListHeader } from "@/hooks/use-collapsible-list-header";
import { fonts, useTheme } from "@/styles";

type AnimatedStyles = Pick<
  ReturnType<typeof useCollapsibleListHeader>,
  | "animatedCardStyle"
  | "animatedTitleStyle"
  | "animatedSubtitleStyle"
  | "animatedStatsStyle"
  | "isHeaderCompact"
>;

interface StatConfig {
  label: string;
  value: string | number;
}

interface ListPageHeaderProps {
  sectionLabel: string;
  title: string;
  subtitle: string;
  stats: [StatConfig, StatConfig];
  searchPlaceholder: string;
  testIDPrefix: string;
  isSearching: boolean;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearchToggle: () => void;
  searchInputRef: React.RefObject<TextInput | null>;
  animatedStyles: AnimatedStyles;
}

export function ListPageHeader({
  sectionLabel,
  title,
  subtitle,
  stats,
  searchPlaceholder,
  testIDPrefix,
  isSearching,
  searchQuery,
  onSearchQueryChange,
  onSearchToggle,
  searchInputRef,
  animatedStyles,
}: ListPageHeaderProps) {
  const { colors: c, isDark } = useTheme();
  const {
    animatedCardStyle,
    animatedTitleStyle,
    animatedSubtitleStyle,
    animatedStatsStyle,
    isHeaderCompact,
  } = animatedStyles;

  return (
    <Animated.View
      style={[
        s.dashboardCard,
        { borderColor: c.border, backgroundColor: c.bgSecondary },
        animatedCardStyle,
      ]}
    >
      <View style={s.headerRow}>
        <View style={s.headerTitleBlock}>
          <Text style={[s.sectionLabel, { color: c.primary }]}>{sectionLabel}</Text>
          <Animated.Text style={[s.pageTitle, { color: c.text }, animatedTitleStyle]}>
            {title}
          </Animated.Text>
          {!isSearching && (
            <Animated.View style={[s.subtitleWrap, animatedSubtitleStyle]}>
              <Text style={[s.pageSubtitle, { color: c.textSecondary }]}>{subtitle}</Text>
            </Animated.View>
          )}
        </View>

        <Pressable
          style={[
            isHeaderCompact && !isSearching ? s.searchIconBtnCompact : s.searchIconBtn,
            {
              backgroundColor: isSearching
                ? c.primary
                : isDark
                  ? "rgba(0,0,0,0.1)"
                  : "rgba(255,255,255,0.78)",
            },
          ]}
          onPress={onSearchToggle}
          hitSlop={6}
          testID={`${testIDPrefix}-search-toggle`}
        >
          <IconSymbol
            name={isSearching ? "xmark" : "magnifyingglass"}
            size={isHeaderCompact && !isSearching ? 16 : 14}
            color={isSearching ? "#ffffff" : c.textSecondary}
          />
        </Pressable>
      </View>

      {isSearching ? (
        <View
          style={[
            s.searchBarWrap,
            { backgroundColor: isDark ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.7)" },
          ]}
        >
          <IconSymbol name="magnifyingglass" size={16} color={c.textSecondary} />
          <TextInput
            ref={searchInputRef}
            style={[s.searchInput, { color: c.text }]}
            placeholder={searchPlaceholder}
            placeholderTextColor={c.textSecondary}
            value={searchQuery}
            onChangeText={onSearchQueryChange}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            testID={`${testIDPrefix}-search-input`}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => {
                onSearchQueryChange("");
                searchInputRef.current?.focus();
              }}
              hitSlop={8}
            >
              <IconSymbol name="xmark.circle.fill" size={18} color={c.textSecondary} />
            </Pressable>
          )}
        </View>
      ) : (
        <Animated.View style={[s.statsWrap, animatedStatsStyle]}>
          <View style={s.statsRow}>
            <View
              style={[
                s.statBox,
                {
                  backgroundColor: isDark ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.7)",
                },
              ]}
            >
              <Text style={[s.statLabel, { color: c.textSecondary }]}>{stats[0].label}</Text>
              <Text style={[s.statValue, { color: c.text }]} numberOfLines={1} adjustsFontSizeToFit>
                {stats[0].value}
              </Text>
            </View>
            <View style={[s.statBox, { backgroundColor: c.primary }]}>
              <Text style={[s.statLabel, { color: "rgba(255,255,255,0.8)" }]}>
                {stats[1].label}
              </Text>
              <Text
                style={[s.statValueCapitalized, { color: "#ffffff" }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {stats[1].value}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  dashboardCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTitleBlock: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.18 * 11,
  },
  searchIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  searchIconBtnCompact: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    marginTop: 8,
    fontSize: 24,
    fontFamily: fonts.bold,
  },
  subtitleWrap: {
    overflow: "hidden",
  },
  pageSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 24,
  },
  statsWrap: {
    overflow: "hidden",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: fonts.regular,
    textTransform: "uppercase",
    letterSpacing: 0.16 * 11,
  },
  statValue: {
    marginTop: 4,
    fontSize: 24,
    fontFamily: fonts.bold,
  },
  statValueCapitalized: {
    marginTop: 4,
    fontSize: 24,
    fontFamily: fonts.bold,
    textTransform: "capitalize",
  },
  searchBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    paddingVertical: 0,
    ...(Platform.OS === "web" ? { outlineStyle: "none" as never } : {}),
  },
});
