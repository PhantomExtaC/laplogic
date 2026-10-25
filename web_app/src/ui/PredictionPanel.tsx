import { ProbabilityBars } from '../charts/ProbabilityBars';
import type { ProbabilityRow } from '../domain/types/charts';
export function PredictionPanel({ rows, coverage, fieldSize }: { rows: ProbabilityRow[]; coverage: { count: number; mass: number }; fieldSize?: number | null }) {
  return <ProbabilityBars rows={rows} summary={`${rows.length} shown of ${fieldSize ?? 'unknown'} event drivers; ${coverage.count} published probabilities. ${(coverage.mass * 100).toFixed(1)}% of probability mass. Raw probabilities, without normalization.`} />;
}
