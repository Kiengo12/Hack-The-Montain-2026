import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Colors } from '../constants/colors';
import type { Condition } from '../types';

interface Props {
  conditions: Condition[];
  selected: Condition;
  onChange: (condition: Condition) => void;
}

const LABELS: Record<Condition, string> = {
  deuteranopia: 'Deuteranopia',
  protanopia: 'Protanopia',
  tritanopia: 'Tritanopia',
};

export function ConditionSelector({ conditions, selected, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {conditions.map((condition) => {
        const isSelected = condition === selected;
        return (
          <Pressable
            key={condition}
            style={[styles.pill, isSelected && styles.pillSelected]}
            onPress={() => onChange(condition)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={LABELS[condition]}
          >
            <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
              {LABELS[condition]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
  },
  pillSelected: {
    backgroundColor: Colors.pillSelected,
    borderColor: Colors.pillSelected,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  pillTextSelected: {
    color: Colors.pillSelectedText,
    fontWeight: '700',
  },
});
