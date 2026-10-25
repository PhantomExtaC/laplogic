export interface ChartSeries { id: string; label: string; color: string }
export interface TrendPoint { x: number; values: Record<string, number | null> }
export interface ProbabilityRow { id: string; label: string; probability: number | null }
