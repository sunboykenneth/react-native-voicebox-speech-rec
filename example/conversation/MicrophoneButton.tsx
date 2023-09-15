import React, {useCallback, useEffect, useRef} from 'react';
import {StyleSheet, Image, Animated as PulseAnimated} from 'react-native';
import {
  TouchableOpacity,
  PanGestureHandler,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';

const STATIC_MIC_PIC = '../static/static_mic.png';
const STATIC_MIC_RESOURCE = require(STATIC_MIC_PIC);

const MIC_IMAGE_HEIGHT = 140;

const SWIPE_UP_MIN_DISTANCE = 80;

const styles = StyleSheet.create({
  disabledMicContainer: {
    opacity: 0.5,
  },
  micImage: {
    height: MIC_IMAGE_HEIGHT,
    resizeMode: 'contain',
  },
});

interface MicrophoneButtonProps {
  containerStyle?: object;
  disabled?: boolean;
  handleButtonPressed: () => void;
  handleButtonReleased: () => void;
  handleButtonSwipeUp: () => void;
  isInListeningMode: boolean;
  tooltipText: React.ReactNode;
}

export const MicrophoneButton = React.memo(
  ({
    containerStyle,
    disabled,
    handleButtonPressed,
    handleButtonReleased,
    handleButtonSwipeUp,
    isInListeningMode,
    tooltipText,
  }: MicrophoneButtonProps) => {
    const micPosition = useSharedValue(0);
    const isSwipedUp = useSharedValue(false);
    const pulseAnimatedScale = useRef(new PulseAnimated.Value(1)).current;

    const startPulseAnimation = useCallback(() => {
      PulseAnimated.loop(
        PulseAnimated.sequence([
          PulseAnimated.timing(pulseAnimatedScale, {
            toValue: 1.4,
            duration: 400,
            useNativeDriver: false,
          }),
          PulseAnimated.timing(pulseAnimatedScale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
          }),
        ]),
      ).start();
    }, [pulseAnimatedScale]);

    useEffect(() => {
      if (isInListeningMode) {
        startPulseAnimation();
      } else {
        pulseAnimatedScale.stopAnimation(() => {
          pulseAnimatedScale.setValue(1); // Reset to the original scale
        });
      }
    }, [isInListeningMode, pulseAnimatedScale, startPulseAnimation]);

    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_: any, ctx: any) => {
        'worklet';
        isSwipedUp.value = false;
        ctx.startY = micPosition.value;
      },
      onActive: (event: any, ctx: any) => {
        'worklet';
        let newPosition = ctx.startY + event.translationY;

        // Limit the swiping distance
        if (newPosition < -(SWIPE_UP_MIN_DISTANCE + 10)) {
          newPosition = -(SWIPE_UP_MIN_DISTANCE + 10);
        }

        micPosition.value = newPosition;

        if (micPosition.value <= -SWIPE_UP_MIN_DISTANCE && !isSwipedUp.value) {
          isSwipedUp.value = true;
        }
      },
      onFinish: (_event: any, _context: any, _isCanceledOrFailed: any) => {
        'worklet';

        if (isSwipedUp.value) {
          runOnJS(handleButtonSwipeUp)();
        } else {
          runOnJS(handleButtonReleased)();
        }

        isSwipedUp.value = false;
        micPosition.value = withSpring(0);
      },
    });

    const animatedStyles = useAnimatedStyle(() => {
      'worklet';
      return {
        transform: [{translateY: micPosition.value}],
      };
    });

    return (
      <GestureHandlerRootView style={{...containerStyle}}>
        <PulseAnimated.View style={{transform: [{scale: pulseAnimatedScale}]}}>
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View
              style={[animatedStyles, disabled && styles.disabledMicContainer]}>
              <TouchableOpacity
                activeOpacity={1}
                onPressIn={handleButtonPressed}
                disabled={disabled}>
                <Image style={styles.micImage} source={STATIC_MIC_RESOURCE} />
              </TouchableOpacity>
            </Animated.View>
          </PanGestureHandler>
        </PulseAnimated.View>
        {tooltipText}
      </GestureHandlerRootView>
    );
  },
);
MicrophoneButton.displayName = 'MicrophoneButton';
