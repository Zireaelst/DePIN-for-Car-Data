import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';

export function HelloWave() {
  // Animation for the car moving side to side
  const moveAnimation = useSharedValue(0);

  useEffect(() => {
    moveAnimation.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 150 }),
        withTiming(-5, { duration: 150 }),
        withTiming(0, { duration: 150 })
      ),
      3 // Run the animation 3 times
    );
  }, [moveAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: moveAnimation.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={styles.text}>🚗</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});
