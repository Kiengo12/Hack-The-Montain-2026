import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { ModeCard } from '../components/ModeCard';
import { Colors } from '../constants/colors';
import type { RootStackParamList } from '../types';

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>ChromaAccess</Text>
          <Text style={styles.subtitle}>Make art accessible to everyone</Text>
        </View>

        <View style={styles.cards}>
          <ModeCard
            icon="👁"
            title="Museum Mode"
            description="Adjust a painting for your vision"
            onPress={() => navigation.navigate('MuseumMode')}
          />
          <ModeCard
            icon="🎨"
            title="Designer Mode"
            description="Check your artwork's accessibility"
            onPress={() => navigation.navigate('DesignerMode')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 48,
  },
  hero: {
    gap: 8,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  cards: {
    gap: 16,
  },
});
