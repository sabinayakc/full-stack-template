import {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface UseStickyListHeaderOptions {
  /** Scroll offset threshold to show the sticky bar (default: 260) */
  threshold?: number;
  /** Callback when near the end of the scroll (for infinite scroll) */
  onEndReached?: () => void;
  /** Distance from the end to trigger onEndReached (default: 40) */
  endReachedThreshold?: number;
}

export function useStickyListHeader(options?: UseStickyListHeaderOptions) {
  const threshold = options?.threshold ?? 260;
  const endReachedThreshold = options?.endReachedThreshold ?? 40;

  const stickyOpacity = useSharedValue(0);
  const isShowing = useSharedValue(false);
  const showBackToTop = useSharedValue(false);

  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = Math.max(0, event.contentOffset.y);

      // Hysteresis: show past threshold, hide when scrolled back above it (with 40px buffer)
      let shouldShow: boolean;
      if (!isShowing.value && y > threshold) {
        shouldShow = true;
      } else if (isShowing.value && y < threshold - 40) {
        shouldShow = false;
      } else {
        shouldShow = isShowing.value;
      }

      if (shouldShow !== isShowing.value) {
        isShowing.value = shouldShow;
        const target = shouldShow ? 1 : 0;
        stickyOpacity.value = withTiming(target, { duration: 180 });
      }

      // Back-to-top: only when scrolled down AND near the end of content
      const { layoutMeasurement, contentOffset, contentSize } = event;
      const nearEnd =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - endReachedThreshold;
      const shouldShowBackToTop = y > 0 && nearEnd;
      if (shouldShowBackToTop !== showBackToTop.value) {
        showBackToTop.value = shouldShowBackToTop;
      }

      if (nearEnd && options?.onEndReached) {
        runOnJS(options.onEndReached)();
      }
    },
  });

  const stickyBarStyle = useAnimatedStyle(() => ({
    opacity: stickyOpacity.value,
    pointerEvents: isShowing.value ? ("auto" as const) : ("none" as const),
    transform: [{ translateY: isShowing.value ? 0 : -100 }],
  }));

  return {
    stickyBarStyle,
    handleScroll,
    showBackToTop,
  };
}
