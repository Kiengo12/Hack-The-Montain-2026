import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '../constants/colors';

interface Props {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}

export function ModeCard({ icon, title, description, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    gap: 16,
  },
  cardPressed: {
    opacity: 0.75,
    borderColor: Colors.primary,
  },
  icon: {
    fontSize: 36,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  chevron: {
    fontSize: 24,
    color: Colors.textMuted,
  },
});
