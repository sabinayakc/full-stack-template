import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { EmptyState } from "@/components/ui/empty-state";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { fonts, useTheme } from "@/styles";

interface ListScaffoldProps {
  isLoading: boolean;
  isEmpty: boolean;
  emptyIcon: string;
  emptyTitle: string;
  emptySubtitle: string;
  isRefetching: boolean;
  onRefresh: () => void;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  isFetchingNextPage: boolean;
  children: React.ReactNode;
}

export function ListScaffold({
  isLoading,
  isEmpty,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
  isRefetching,
  onRefresh,
  onScroll,
  isFetchingNextPage,
  children,
}: ListScaffoldProps) {
  const { colors: c } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const showBackToTop = useSharedValue(false);
  const [userPulled, setUserPulled] = useState(false);

  useEffect(() => {
    if (!isRefetching) setUserPulled(false);
  }, [isRefetching]);

  const handleScrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScroll(event);
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const nearEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
      const shouldShow = contentOffset.y > 0 && nearEnd;
      if (shouldShow !== showBackToTop.value) {
        showBackToTop.value = shouldShow;
      }
    },
    [onScroll, showBackToTop],
  );

  const backToTopStyle = useAnimatedStyle(() => ({
    opacity: withTiming(showBackToTop.value ? 1 : 0, { duration: 200 }),
  }));

  if (isLoading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isEmpty) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} subtitle={emptySubtitle} />;
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      ref={scrollRef}
      style={[s.flex1, s.listPadding]}
      contentContainerStyle={s.listContent}
      refreshControl={
        <RefreshControl
          refreshing={userPulled && isRefetching}
          onRefresh={() => {
            setUserPulled(true);
            onRefresh();
          }}
          tintColor={c.textSecondary}
        />
      }
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      {children}
      {isFetchingNextPage && (
        <View style={s.loadingMore}>
          <ActivityIndicator size="small" />
        </View>
      )}
      <Animated.View style={[s.backToTopRow, backToTopStyle]}>
        <Pressable
          style={[s.backToTopBtn, { borderColor: c.border, backgroundColor: c.bgSecondary }]}
          onPress={handleScrollToTop}
        >
          <IconSymbol name="chevron.up" size={14} color={c.textSecondary} />
          <Text style={[s.backToTopText, { color: c.textSecondary }]}>Back to top</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listPadding: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContent: {
    paddingBottom: 160,
  },
  loadingMore: {
    alignItems: "center",
    paddingVertical: 16,
  },
  backToTopRow: {
    alignItems: "center",
    paddingVertical: 24,
  },
  backToTopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backToTopText: {
    fontSize: 12,
    fontFamily: fonts.semibold,
  },
});
