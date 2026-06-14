import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type LayoutChangeEvent, StyleSheet, Text, View } from "react-native";

import Animated, {
  FadeIn,
  FadeOut,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { fonts, useTheme } from "@/styles";

export interface WizardStep {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  /** Return true to allow proceeding, or a string error message. Can be async. */
  validate?: () => boolean | string | Promise<boolean | string>;
  /** If true, skip this step */
  skip?: boolean;
}

interface StepWizardProps {
  steps: WizardStep[];
  onComplete: () => void;
  initialStepId?: string;
  onStepChange?: (stepId: string, index: number) => void;
  /** Render custom footer buttons. If not provided, default Next/Back/Complete buttons render. */
  renderFooter?: (helpers: StepWizardHelpers) => React.ReactNode;
  /** Ref that receives the current helpers on every render — useful for rendering a footer outside the wizard. */
  helpersRef?: React.MutableRefObject<StepWizardHelpers | null>;
}

export interface StepWizardHelpers {
  currentIndex: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoForward: boolean;
  isLastStep: boolean;
  isValidating: boolean;
  goNext: () => Promise<boolean>;
  goBack: () => void;
  goTo: (index: number) => void;
  validationError: string | null;
}

export function StepWizard({
  steps,
  onComplete,
  initialStepId,
  onStepChange,
  renderFooter,
  helpersRef,
}: StepWizardProps) {
  const { colors: c } = useTheme();
  const activeSteps = useMemo(() => steps.filter((s) => !s.skip), [steps]);
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (!initialStepId) {
      return 0;
    }

    const nextIndex = activeSteps.findIndex((step) => step.id === initialStepId);
    return nextIndex >= 0 ? nextIndex : 0;
  });
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [progressTrackWidth, setProgressTrackWidth] = useState(0);
  const totalSteps = activeSteps.length;
  const currentStep = activeSteps[currentIndex];
  const isLastStep = currentIndex === totalSteps - 1;
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < totalSteps - 1;

  const onStepChangeRef = useRef(onStepChange);
  useEffect(() => {
    onStepChangeRef.current = onStepChange;
  });

  const currentStepId = currentStep?.id;
  useEffect(() => {
    if (!currentStepId) return;
    onStepChangeRef.current?.(currentStepId, currentIndex);
  }, [currentIndex, currentStepId]);

  const goNext = useCallback(async () => {
    const step = activeSteps[currentIndex];
    if (step?.validate) {
      setIsValidating(true);
      try {
        const result = await step.validate();
        if (result !== true) {
          setValidationError(typeof result === "string" ? result : "Please complete this step");
          return false;
        }
      } finally {
        setIsValidating(false);
      }
    }
    setValidationError(null);

    if (isLastStep) {
      onComplete();
      return true;
    }

    setDirection("forward");
    setCurrentIndex((i) => Math.min(i + 1, totalSteps - 1));
    return true;
  }, [activeSteps, currentIndex, isLastStep, onComplete, totalSteps]);

  const goBack = useCallback(() => {
    if (!canGoBack) return;
    setValidationError(null);
    setDirection("backward");
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, [canGoBack]);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSteps) return;
      setValidationError(null);
      const dir = index > currentIndex ? "forward" : "backward";
      setDirection(dir);
      setCurrentIndex(index);
    },
    [currentIndex, totalSteps],
  );

  const helpers: StepWizardHelpers = {
    currentIndex,
    totalSteps,
    canGoBack,
    canGoForward,
    isLastStep,
    isValidating,
    goNext,
    goBack,
    goTo,
    validationError,
  };

  if (helpersRef) {
    helpersRef.current = helpers;
  }

  // Progress bar animation
  const progressStyle = useAnimatedStyle(() => {
    const progress = totalSteps > 0 ? (currentIndex + 1) / totalSteps : 1;
    return {
      width: withTiming(progressTrackWidth * progress, {
        duration: 220,
      }),
    };
  }, [currentIndex, progressTrackWidth, totalSteps]);

  const handleProgressTrackLayout = useCallback((event: LayoutChangeEvent) => {
    setProgressTrackWidth(event.nativeEvent.layout.width);
  }, []);

  const enterAnim =
    direction === "forward" ? SlideInRight.duration(300) : SlideInLeft.duration(300);
  const exitAnim =
    direction === "forward" ? SlideOutLeft.duration(300) : SlideOutRight.duration(300);

  if (!currentStep) return null;

  return (
    <View style={st.container}>
      {/* Progress bar */}
      <View style={st.progressSection}>
        <View style={st.progressHeader}>
          <Text style={[st.stepCounter, { color: c.textSecondary }]}>
            Step {currentIndex + 1} of {totalSteps}
          </Text>
        </View>
        <View
          style={[st.progressTrack, { backgroundColor: c.border }]}
          onLayout={handleProgressTrackLayout}
        >
          <Animated.View
            style={[
              {
                height: "100%",
                width: 0,
                borderRadius: 999,
                minWidth: progressTrackWidth > 0 ? 12 : 0,
              },
              progressStyle,
            ]}
          >
            <View style={[st.progressFill, { backgroundColor: c.primary }]} />
          </Animated.View>
        </View>
      </View>

      {/* Step header */}
      <Animated.View
        key={`header-${currentStep.id}`}
        entering={FadeIn.duration(250)}
        exiting={FadeOut.duration(150)}
        style={st.stepHeader}
      >
        <Text style={[st.stepTitle, { color: c.primary }]}>{currentStep.title}</Text>
        {currentStep.subtitle ? (
          <Text style={[st.stepSubtitle, { color: c.textSecondary }]}>{currentStep.subtitle}</Text>
        ) : null}
      </Animated.View>

      {/* Step content */}
      <Animated.View
        key={`content-${currentStep.id}`}
        entering={enterAnim}
        exiting={exitAnim}
        style={st.stepContent}
      >
        {currentStep.content}
      </Animated.View>

      {/* Validation error */}
      {validationError ? (
        <Animated.View entering={FadeIn.duration(200)} style={st.errorWrapper}>
          <View
            style={[
              st.errorBox,
              { borderColor: `${c.danger}4D`, backgroundColor: `${c.danger}1A` },
            ]}
          >
            <Text style={[st.errorText, { color: c.danger }]}>{validationError}</Text>
          </View>
        </Animated.View>
      ) : null}

      {/* Footer */}
      {renderFooter ? renderFooter(helpers) : null}
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressSection: {
    gap: 12,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepCounter: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  progressTrack: {
    height: 8,
    overflow: "hidden",
    borderRadius: 9999,
  },
  progressFill: {
    height: "100%",
    width: "100%",
    borderRadius: 9999,
  },
  stepHeader: {
    gap: 4,
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: fonts.bold,
  },
  stepSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  stepContent: {
    flex: 1,
  },
  errorWrapper: {
    marginTop: 16,
  },
  errorBox: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
});
