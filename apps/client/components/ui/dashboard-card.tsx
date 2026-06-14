import type { ReactNode } from "react";
import type { TextStyle, ViewStyle } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { fonts, useTheme } from "@/styles";

interface DashboardCardProps {
  sectionLabel: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  /** Extra content rendered in the header row to the right of the title block */
  headerRight?: ReactNode;
  /** Extra content rendered between section label and title */
  headerTop?: ReactNode;
  animated?: boolean;
  animatedStyle?: ViewStyle;
  animatedTitleStyle?: TextStyle;
  animatedSubtitleStyle?: ViewStyle;
  style?: ViewStyle;
  testID?: string;
}

export function DashboardCard({
  sectionLabel,
  title,
  subtitle,
  children,
  headerRight,
  headerTop,
  animated,
  animatedStyle,
  animatedTitleStyle,
  animatedSubtitleStyle,
  style,
  testID,
}: DashboardCardProps) {
  const { colors: c } = useTheme();
  const Container = animated ? Animated.View : View;
  const TitleComponent = animated && animatedTitleStyle ? Animated.Text : Text;
  const SubtitleWrapper = animated && animatedSubtitleStyle ? Animated.View : View;

  return (
    <Container
      style={[
        s.card,
        { borderColor: c.border, backgroundColor: c.bgSecondary },
        style,
        animated ? animatedStyle : undefined,
      ]}
      testID={testID}
    >
      <View style={s.headerRow}>
        <View style={s.headerTitleBlock}>
          {headerTop}
          <Text style={[s.sectionLabel, { color: c.primary }]}>{sectionLabel}</Text>
          <TitleComponent
            style={[s.pageTitle, { color: c.text }, animated ? animatedTitleStyle : undefined]}
          >
            {title}
          </TitleComponent>
          {subtitle ? (
            <SubtitleWrapper style={[s.subtitleWrap, animated ? animatedSubtitleStyle : undefined]}>
              <Text style={[s.pageSubtitle, { color: c.textSecondary }]}>{subtitle}</Text>
            </SubtitleWrapper>
          ) : null}
        </View>
        {headerRight}
      </View>
      {children}
    </Container>
  );
}

const s = StyleSheet.create({
  card: {
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
  pageTitle: {
    marginTop: 8,
    fontSize: 24,
    fontFamily: fonts.bold,
  },
  subtitleWrap: {
    overflow: "hidden",
  },
  pageSubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 24,
  },
});
