import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ConditionSelector } from '../components/ConditionSelector';
import { ImageComparison } from '../components/ImageComparison';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { SeveritySlider } from '../components/SeveritySlider';
import { Colors } from '../constants/colors';
import { useApiRequest } from '../hooks/useApiRequest';
import { useImagePicker } from '../hooks/useImagePicker';
import { api } from '../services/api';
import type { Condition, ImageResponse, UploadResponse } from '../types';

const CONDITIONS: Condition[] = ['deuteranopia', 'protanopia', 'tritanopia'];

export function MuseumModeScreen() {
  const { pickFromGallery, pickFromCamera } = useImagePicker();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageDims, setImageDims] = useState({ width: 320, height: 240 });
  const [uploadedId, setUploadedId] = useState<string | null>(null);
  const [condition, setCondition] = useState<Condition>('deuteranopia');
  const [severity, setSeverity] = useState(0.8);
  const [correctedB64, setCorrectedB64] = useState<string | null>(null);

  const uploadReq = useApiRequest<UploadResponse>();
  const correctReq = useApiRequest<ImageResponse>();

  const loading = uploadReq.loading || correctReq.loading;

  async function handlePick(source: 'gallery' | 'camera') {
    const picked =
      source === 'gallery' ? await pickFromGallery() : await pickFromCamera();
    if (!picked) return;

    setCorrectedB64(null);
    setImageUri(picked.uri);
    setImageDims({ width: picked.width, height: picked.height });

    const result = await uploadReq.execute(() => api.upload(picked.uri));
    if (result) setUploadedId(result.image_id);
  }

  async function handleCorrect() {
    if (!uploadedId) return;
    const result = await correctReq.execute(() =>
      api.correct({ image_id: uploadedId, condition, severity }),
    );
    if (result) setCorrectedB64(result.image_base64);
  }

  async function handleSave() {
    if (!correctedB64) return;
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow photo library access to save.');
      return;
    }
    const uri = `data:image/png;base64,${correctedB64}`;
    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert('Saved', 'Corrected image saved to your photo library.');
  }

  async function handleShare() {
    if (!correctedB64) return;
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Sharing not available on this device.');
      return;
    }
    await Sharing.shareAsync(`data:image/png;base64,${correctedB64}`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <LoadingOverlay
        visible={loading}
        message={uploadReq.loading ? 'Uploading…' : 'Correcting image…'}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Museum Mode</Text>

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

        <Text style={styles.sectionLabel}>Vision type</Text>
        <ConditionSelector
          conditions={CONDITIONS}
          selected={condition}
          onChange={setCondition}
        />

        <SeveritySlider value={severity} onChange={setSeverity} />

        <Pressable
          style={[styles.primaryBtn, !uploadedId && styles.btnDisabled]}
          onPress={handleCorrect}
          disabled={!uploadedId}
        >
          <Text style={styles.primaryBtnText}>Correct image</Text>
        </Pressable>

        {correctReq.error && <Text style={styles.error}>{correctReq.error}</Text>}

        {correctedB64 && imageUri && (
          <>
            <Text style={styles.sectionLabel}>Before / After</Text>
            <ImageComparison
              originalUri={imageUri}
              correctedBase64={correctedB64}
              width={imageDims.width}
              height={imageDims.height}
            />
            <View style={styles.pickerRow}>
              <Pressable style={styles.btn} onPress={handleSave}>
                <Text style={styles.btnText}>💾 Save</Text>
              </Pressable>
              <Pressable style={styles.btn} onPress={handleShare}>
                <Text style={styles.btnText}>↑ Share</Text>
              </Pressable>
            </View>
          </>
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  error: {
    color: Colors.scoreRed,
    fontSize: 13,
  },
});
