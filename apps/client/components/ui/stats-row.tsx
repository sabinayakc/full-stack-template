import type { ViewStyle } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { fonts, useTheme } from "@/styles";

export interface StatItem {
  label: string;
  value: string | number;
  variant?: "default" | "primary";
}

interface StatsRowProps {
  stats: StatItem[];
  animated?: boolean;
  animatedStyle?: ViewStyle;
  style?: ViewStyle;
}

export function StatsRow({ stats, animated, animatedStyle, style }: StatsRowProps) {
  const { colors: c } = useTheme();
  const Container = animated ? Animated.View : View;

  return (
    <Container style={[s.wrap, style, animated ? animatedStyle : undefined]}>
      <View style={s.row}>
        {stats.map((stat) => {
          const isPrimary = stat.variant === "primary";
          return (
            <View
              key={stat.label}
              style={[
                s.statBox,
                isPrimary ? { backgroundColor: c.primary } : { backgroundColor: c.bgSecondary },
              ]}
            >
              <Text
                style={[
                  s.statLabel,
                  { color: isPrimary ? "rgba(255,255,255,0.8)" : c.textSecondary },
                ]}
              >
                {stat.label}
              </Text>
              <Text
                style={[
                  s.statValue,
                  isPrimary && s.statValueCapitalize,
                  { color: isPrimary ? "#ffffff" : c.text },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {stat.value}
              </Text>
            </View>
          );
        })}
      </View>
    </Container>
  );
}

const s = StyleSheet.create({
  wrap: {
    overflow: "hidden",
  },
  row: {
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
  statValueCapitalize: {
    textTransform: "capitalize",
  },
});
