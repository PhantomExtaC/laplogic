import { ProbabilityBars } from '../charts/ProbabilityBars';
import type { ProbabilityRow } from '../domain/types/charts';
export function PredictionPanel({ rows, coverage }: { rows: ProbabilityRow[]; coverage: { count: number; mass: number } }) {
  return <ProbabilityBars rows={rows} summary={`${coverage.count} published drivers; event field size unavailable. ${(coverage.mass * 100).toFixed(1)}% of probability mass. Raw probabilities, without normalization.`} />;
}
