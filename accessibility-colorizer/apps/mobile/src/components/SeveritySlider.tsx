import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Colors } from '../constants/colors';

interface Props {
  label?: string;
  value: number;
  onChange: (value: number) => void;
}

const TRACK_WIDTH = 280;

export function SeveritySlider({ label = 'Severity', value, onChange }: Props) {
  const thumbX = useSharedValue(value * TRACK_WIDTH);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const clamped = Math.max(0, Math.min(TRACK_WIDTH, e.x));
      thumbX.value = clamped;
      onChange(clamped / TRACK_WIDTH);
    })
    .runOnJS(true);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value - 12 }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value,
  }));

  const pct = Math.round(value * 100);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{pct}%</Text>
      </View>
      <GestureDetector gesture={pan}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle]} />
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  track: {
    width: TRACK_WIDTH,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
});
