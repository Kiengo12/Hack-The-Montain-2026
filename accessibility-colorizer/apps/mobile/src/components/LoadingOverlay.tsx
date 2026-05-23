import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { Colors } from '../constants/colors';

interface Props {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message = 'Loading…' }: Props) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      scale.value = withRepeat(
        withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      scale.value = 1;
    }
  }, [visible, scale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.pulse, pulseStyle]} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    gap: 20,
  },
  pulse: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    opacity: 0.8,
  },
  message: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
});
