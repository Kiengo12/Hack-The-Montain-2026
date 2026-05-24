import React, { useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FeedbackCard } from '../components/FeedbackCard';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ScoreBadge } from '../components/ScoreBadge';
import { Colors } from '../constants/colors';
import { useApiRequest } from '../hooks/useApiRequest';
import { useImagePicker } from '../hooks/useImagePicker';
import { api } from '../services/api';
import type {
  AnalysisResponse,
  Condition,
  UploadResponse,
} from '../types';

const CONDITIONS: Condition[] = ['deuteranopia', 'protanopia', 'tritanopia'];

const CONDITION_LABELS: Record<Condition, string> = {
  deuteranopia: 'Deuteranopia',
  protanopia: 'Protanopia',
  tritanopia: 'Tritanopia',
};

export function DesignerModeScreen() {
  const { pickFromGallery, pickFromCamera } = useImagePicker();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadedId, setUploadedId] = useState<string | null>(null);

  const uploadReq = useApiRequest<UploadResponse>();
  const analyzeReq = useApiRequest<AnalysisResponse>();

  const loading = uploadReq.loading || analyzeReq.loading;

  async function handlePick(source: 'gallery' | 'camera') {
    analyzeReq.reset();
    setImageUri(null);
    setUploadedId(null);

    const picked =
      source === 'gallery' ? await pickFromGallery() : await pickFromCamera();
    if (!picked) return;

    setImageUri(picked.uri);
    const result = await uploadReq.execute(() => api.upload(picked.uri));
    if (result) setUploadedId(result.image_id);
  }

  async function handleAnalyze() {
    if (!uploadedId) return;
    await analyzeReq.execute(() => api.analyze(uploadedId));
  }

  const analysis = analyzeReq.data;

  return (
    <SafeAreaView style={styles.safe}>
      <LoadingOverlay
        visible={loading}
        message={analyzeReq.loading ? 'Analyzing your artwork…' : 'Uploading…'}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Designer Mode</Text>

        <View style={styles.pickerRow}>
          <Pressable style={styles.btn} onPress={() => handlePick('gallery')}>
            <Text style={styles.btnText}>Gallery</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={() => handlePick('camera')}>
            <Text style={styles.btnText}>Camera</Text>
          </Pressable>
        </View>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.thumbnail} resizeMode="cover" />
        )}

        {uploadReq.error && <Text style={styles.error}>{uploadReq.error}</Text>}

        <Pressable
          style={[styles.primaryBtn, !uploadedId && styles.btnDisabled]}
          onPress={handleAnalyze}
          disabled={!uploadedId}
        >
          <Text style={styles.primaryBtnText}>Analyze accessibility</Text>
        </Pressable>

        {analyzeReq.error && <Text style={styles.error}>{analyzeReq.error}</Text>}

        {analysis && (
          <View style={styles.results}>
            <ScoreBadge score={analysis.overall_score} />

            <Text style={styles.stat}>
              Affects ~{analysis.affected_population_pct.toFixed(1)}% of viewers
            </Text>

            <Text style={styles.summary}>{analysis.summary}</Text>

            {analysis.top_issues.length > 0 && (
              <View style={styles.topIssues}>
                <Text style={styles.sectionLabel}>Top Issues</Text>
                {analysis.top_issues.map((issue, idx) => (
                  <Text key={idx} style={styles.bulletItem}>
                    • {issue}
                  </Text>
                ))}
              </View>
            )}

            <Text style={styles.sectionLabel}>By Condition</Text>
            {CONDITIONS.map((cond) => {
              const condData = analysis.conditions[cond];
              if (!condData) return null;
              return (
                <FeedbackCard
                  key={cond}
                  conditionName={CONDITION_LABELS[cond]}
                  severity={condData.severity}
                  issues={condData.issues}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: 24, gap: 20 },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  pickerRow: { flexDirection: 'row', gap: 12 },
  btn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  error: { color: Colors.scoreRed, fontSize: 13 },
  results: { gap: 16 },
  stat: {
    textAlign: 'center',
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  summary: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topIssues: { gap: 6 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bulletItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
