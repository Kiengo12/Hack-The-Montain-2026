import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '../constants/colors';
import type { AccessibilityIssue, CVDSeverityLabel } from '../types';

interface Props {
  conditionName: string;
  severity: CVDSeverityLabel;
  issues: AccessibilityIssue[];
}

const SEVERITY_COLORS: Record<CVDSeverityLabel, string> = {
  none: Colors.scoreGreen,
  mild: Colors.scoreAmber,
  moderate: '#F97316',
  severe: Colors.scoreRed,
};

function ColorSwatch({ hex }: { hex: string }) {
  return (
    <View
      style={[styles.swatch, { backgroundColor: hex }]}
      accessibilityLabel={`Color ${hex}`}
    />
  );
}

function IssueRow({ issue }: { issue: AccessibilityIssue }) {
  return (
    <View style={styles.issueRow}>
      <Text style={styles.issueDescription}>{issue.description}</Text>
      <View style={styles.swatchRow}>
        <View style={styles.swatchGroup}>
          {issue.affected_colors.map((h) => (
            <ColorSwatch key={h} hex={h} />
          ))}
        </View>
        <Text style={styles.arrow}>→</Text>
        <View style={styles.swatchGroup}>
          {issue.suggested_colors.map((h) => (
            <ColorSwatch key={h} hex={h} />
          ))}
        </View>
      </View>
      <Text style={styles.recommendation}>{issue.recommendation}</Text>
    </View>
  );
}

export function FeedbackCard({ conditionName, severity, issues }: Props) {
  const [expanded, setExpanded] = useState(false);
  const height = useSharedValue(0);

  const toggle = () => {
    setExpanded((prev) => {
      const next = !prev;
      height.value = withTiming(next ? 1 : 0, { duration: 250 });
      return next;
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: height.value,
    maxHeight: height.value * 800,
    overflow: 'hidden',
  }));

  const severityColor = SEVERITY_COLORS[severity];

  return (
    <View style={styles.card}>
      <Pressable
        style={styles.header}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <Text style={styles.conditionName}>{conditionName}</Text>
        <View style={[styles.severityBadge, { backgroundColor: severityColor + '33' }]}>
          <Text style={[styles.severityText, { color: severityColor }]}>
            {severity}
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      <Animated.View style={animatedStyle}>
        {issues.length === 0 ? (
          <Text style={styles.noIssues}>No issues found for this condition.</Text>
        ) : (
          issues.map((issue, idx) => <IssueRow key={idx} issue={issue} />)
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  conditionName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  chevron: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  noIssues: {
    padding: 16,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  issueRow: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  issueDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  swatchGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  arrow: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  recommendation: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
