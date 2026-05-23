export type Condition = 'deuteranopia' | 'protanopia' | 'tritanopia';

export type CVDSeverityLabel = 'none' | 'mild' | 'moderate' | 'severe';

export interface UploadResponse {
  image_id: string;
  width: number;
  height: number;
}

export interface SimulateParams {
  image_id: string;
  condition: Condition;
  severity: number;
}

export interface CorrectParams {
  image_id: string;
  condition: Condition;
  severity: number;
}

export interface ImageResponse {
  image_id: string;
  image_base64: string;
  condition: string;
  severity: number;
}

export interface DominantColor {
  hex: string;
  percentage: number;
  lab: [number, number, number];
}

export interface ContrastPair {
  color1_hex: string;
  color2_hex: string;
  contrast_ratio: number;
  passes_aa: boolean;
  passes_aaa: boolean;
}

export interface AccessibilityIssue {
  description: string;
  affected_colors: string[];
  recommendation: string;
  suggested_colors: string[];
}

export interface ConditionAnalysis {
  severity: CVDSeverityLabel;
  issues: AccessibilityIssue[];
}

export interface AnalysisResponse {
  image_id: string;
  overall_score: number;
  affected_population_pct: number;
  conditions: Record<Condition, ConditionAnalysis>;
  top_issues: string[];
  summary: string;
  dominant_colors: DominantColor[];
  contrast_pairs: ContrastPair[];
}

export type RootStackParamList = {
  Home: undefined;
  MuseumMode: undefined;
  DesignerMode: undefined;
};
