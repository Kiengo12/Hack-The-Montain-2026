export const Colors = {
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceElevated: '#242424',
  border: '#2E2E2E',

  primary: '#7C6FFF',
  primaryMuted: '#3D3875',

  text: '#F0F0F0',
  textSecondary: '#9A9A9A',
  textMuted: '#5A5A5A',

  scoreGreen: '#22C55E',
  scoreAmber: '#F59E0B',
  scoreRed: '#EF4444',

  pillSelected: '#FFFFFF',
  pillSelectedText: '#0F0F0F',

  overlay: 'rgba(0,0,0,0.7)',

  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorKey = keyof typeof Colors;
