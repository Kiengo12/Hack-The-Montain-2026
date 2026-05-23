import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { Colors } from '../constants/colors';
import { DesignerModeScreen } from '../screens/DesignerModeScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MuseumModeScreen } from '../screens/MuseumModeScreen';
import type { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MuseumMode"
        component={MuseumModeScreen}
        options={{ title: 'Museum Mode' }}
      />
      <Stack.Screen
        name="DesignerMode"
        component={DesignerModeScreen}
        options={{ title: 'Designer Mode' }}
      />
    </Stack.Navigator>
  );
}
