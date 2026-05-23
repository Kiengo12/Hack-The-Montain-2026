import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  clamp,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Colors } from '../constants/colors';

interface Props {
  originalUri: string;
  correctedBase64: string;
  width: number;
  height: number;
}

export function ImageComparison({
  originalUri,
  correctedBase64,
  width,
  height,
}: Props) {
  const dividerX = useSharedValue(width / 2);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      dividerX.value = clamp(e.x, 0, width);
    })
    .runOnJS(false);

  const dividerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dividerX.value }],
  }));

  const correctedClipStyle = useAnimatedStyle(() => ({
    width: width - dividerX.value,
    transform: [{ translateX: dividerX.value }],
  }));

  const correctedImageStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    left: -dividerX.value,
    width,
  }));

  const aspectRatio = width / height;

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.container, { width, aspectRatio }]}>
        {/* Original — full width, bottom layer */}
        <Image
          source={{ uri: originalUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        {/* Corrected — clipped to right of divider */}
        <Animated.View style={[styles.correctedClip, correctedClipStyle]}>
          <Animated.Image
            source={{ uri: `data:image/png;base64,${correctedBase64}` }}
            style={correctedImageStyle}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Divider line */}
        <Animated.View style={[styles.divider, dividerStyle]} />

        {/* Labels */}
        <Text style={[styles.label, styles.labelLeft]}>Original</Text>
        <Text style={[styles.label, styles.labelRight]}>Corrected</Text>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  correctedClip: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    overflow: 'hidden',
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 6,
  },
  label: {
    position: 'absolute',
    bottom: 10,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  labelLeft: {
    left: 10,
  },
  labelRight: {
    right: 10,
  },
});
