export interface ComparisonMetric {
  raw: number | null; normalized: number | null; sampleCount: number;
  higherIsBetter: boolean | null; minimumSamples?: number; unit?: string;
}
export interface ComparisonDriver {
  id: string; metrics: Record<string, ComparisonMetric>;
  tracks?: { trackId: string; metrics: Record<string, ComparisonMetric> }[];
}
