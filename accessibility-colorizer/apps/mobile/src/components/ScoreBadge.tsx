import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '../constants/colors';

interface Props {
  score: number;
}

function scoreColor(score: number): string {
  if (score >= 80) return Colors.scoreGreen;
  if (score >= 50) return Colors.scoreAmber;
  return Colors.scoreRed;
}

export function ScoreBadge({ score }: Props) {
  const color = scoreColor(score);
  return (
    <View style={[styles.circle, { borderColor: color }]}>
      <Text style={[styles.number, { color }]}>{score}</Text>
      <Text style={styles.label}>/ 100</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.surface,
  },
  number: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 38,
  },
  label: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
