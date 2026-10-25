import type { ComparisonDriver, ComparisonMetric } from '../types/comparison';

export function headToHead(a: ComparisonDriver, b: ComparisonDriver, track?: string) {
  if (a.id === b.id) throw new Error('Select two different drivers');
  const keys = [...new Set([...Object.keys(a.metrics), ...Object.keys(b.metrics)])];
  return keys.map(key => {
    const left = track ? a.tracks?.find(row => row.trackId === track)?.metrics[key] : a.metrics[key];
    const right = track ? b.tracks?.find(row => row.trackId === track)?.metrics[key] : b.metrics[key];
    const reason = !left || !right ? 'Metric unavailable in the selected context' :
      left.sampleCount < (left.minimumSamples ?? 1) || right.sampleCount < (right.minimumSamples ?? 1) ? 'Insufficient sample' :
      left.normalized === null || right.normalized === null ? 'Normalization unavailable' :
      left.higherIsBetter === null || right.higherIsBetter === null || left.higherIsBetter !== right.higherIsBetter ? 'Direction unavailable or inconsistent' :
      left.unit && right.unit && left.unit !== right.unit ? 'Units are not comparable' : null;
    const normalized = (metric: ComparisonMetric) => ({ ...metric, normalized: metric.normalized === null ? null : metric.higherIsBetter ? metric.normalized : 100 - metric.normalized });
    return { key, sampleA: left?.sampleCount ?? null, sampleB: right?.sampleCount ?? null, a: !reason && left ? normalized(left) : null, b: !reason && right ? normalized(right) : null, reason };
  });
}
