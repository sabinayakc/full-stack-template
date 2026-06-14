import { useCallback, useEffect, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface UseCollapsibleListHeaderOptions {
  /** Scroll offset threshold to trigger compaction (default: 24) */
  threshold?: number;
  /** Callback when near the end of the scroll (for infinite scroll) */
  onEndReached?: () => void;
  /** Distance from the end to trigger onEndReached (default: 40) */
  endReachedThreshold?: number;
}

export function useCollapsibleListHeader(options?: UseCollapsibleListHeaderOptions) {
  const threshold = options?.threshold ?? 24;
  const endReachedThreshold = options?.endReachedThreshold ?? 40;
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const compactProgress = useSharedValue(0);

  useEffect(() => {
    compactProgress.value = withTiming(isHeaderCompact ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [compactProgress, isHeaderCompact]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    borderRadius: interpolate(compactProgress.value, [0, 1], [28, 22]),
    paddingTop: interpolate(compactProgress.value, [0, 1], [16, 12]),
    paddingBottom: interpolate(compactProgress.value, [0, 1], [16, 12]),
    transform: [{ translateY: interpolate(compactProgress.value, [0, 1], [0, -2]) }],
  }));

  const animatedTitleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(compactProgress.value, [0, 1], [24, 18]),
    marginTop: interpolate(compactProgress.value, [0, 1], [8, 6]),
  }));

  const animatedSubtitleStyle = useAnimatedStyle(() => ({
    opacity: 1 - compactProgress.value,
    height: interpolate(compactProgress.value, [0, 1], [52, 0]),
    marginTop: interpolate(compactProgress.value, [0, 1], [4, 0]),
    transform: [{ translateY: interpolate(compactProgress.value, [0, 1], [0, -6]) }],
  }));

  const animatedStatsStyle = useAnimatedStyle(() => ({
    opacity: 1 - compactProgress.value,
    height: interpolate(compactProgress.value, [0, 1], [76, 0]),
    marginTop: interpolate(compactProgress.value, [0, 1], [16, 0]),
    transform: [{ translateY: interpolate(compactProgress.value, [0, 1], [0, -12]) }],
  }));

  const handleScroll = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = nativeEvent.contentOffset.y;
      // Hysteresis: collapse past threshold, only expand when back near top.
      // Prevents fighting when content barely overflows.
      setIsHeaderCompact((current) => {
        if (!current && offset > threshold) return true;
        if (current && offset <= 4) return false;
        return current;
      });

      if (options?.onEndReached) {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isNearEnd =
          layoutMeasurement.height + contentOffset.y >= contentSize.height - endReachedThreshold;
        if (isNearEnd) {
          options.onEndReached();
        }
      }
    },
    [threshold, endReachedThreshold, options?.onEndReached],
  );

  return {
    isHeaderCompact,
    animatedCardStyle,
    animatedTitleStyle,
    animatedSubtitleStyle,
    animatedStatsStyle,
    handleScroll,
  };
}
