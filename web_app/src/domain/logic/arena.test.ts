import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { arenaHistorySchema } from '../../data/schemas/arena';
import { arenaCohort } from './arena';
import { headToHead } from './comparison';
import type { ComparisonMetric } from '../types/comparison';

const metric: ComparisonMetric = { raw: 0, normalized: 20, sampleCount: 10, minimumSamples: 3, higherIsBetter: false, unit: 'loss index' };
it('normalizes direction, preserves raw zero and rejects identical drivers', () => {
  const a = { id: 'a', metrics: { mastery: metric } }, b = { id: 'b', metrics: { mastery: { ...metric, normalized: 40 } } };
  expect(headToHead(a, b)[0].a?.normalized).toBe(80);
  expect(headToHead(a, b)[0].a?.raw).toBe(0);
  expect(() => headToHead(a, a)).toThrow('different drivers');
});
it('withholds sparse, directionless, incompatible and missing track metrics', () => {
  const a = { id: 'a', metrics: { trackMastery: metric } };
  for (const change of [{ sampleCount: 0 }, { higherIsBetter: null }, { normalized: null }, { unit: 'seconds' }]) {
    const rows = headToHead(a, { id: 'b', metrics: { trackMastery: { ...metric, ...change } } });
    expect(rows[0].a).toBeNull(); expect(rows[0].reason).toBeTruthy();
  }
  expect(headToHead(a, { ...a, id: 'b' }, 'unavailable-track')[0].a).toBeNull();
});
it('uses track-specific sample sizes rather than the overall counts', () => {
  const a = { id: 'a', metrics: { trackMastery: metric }, tracks: [{ trackId: 'track', metrics: { trackMastery: { ...metric, sampleCount: 1 } } }] };
  const b = { ...a, id: 'b' };
  const result = headToHead(a, b, 'track')[0];
  expect(result.sampleA).toBe(1); expect(result.reason).toBe('Insufficient sample');
});
it('applies selected track context to every metric, including finish and points', () => {
  const a = { id: 'a', metrics: { 'Mean finish': metric }, tracks: [{ trackId: 'track', metrics: { 'Mean finish': { ...metric, raw: 8, sampleCount: 3 } } }] };
  expect(headToHead(a, { ...a, id: 'b' }, 'track')[0].a?.raw).toBe(8);
  expect(headToHead(a, { ...a, id: 'b' }, 'missing')[0].a).toBeNull();
});
it('keeps one common cohort with identical denominators and auditable exclusions', () => {
  const history = arenaHistorySchema.parse(JSON.parse(readFileSync('public/data/arena_history.json', 'utf8')));
  const cohort = arenaCohort(history.data);
  expect(cohort.excluded.length).toBeGreaterThan(0);
  expect(new Set(cohort.summaries.map(model => model.denominator)).size).toBe(1);
  for (const model of cohort.summaries) {
    expect(model.denominator).toBe(cohort.eligible.length);
    expect(cohort.points.at(-1)?.values[model.id]).toBe((model.accuracy ?? 0) * 100);
  }
  const empty = arenaCohort(history.data, 1900, 'post-quali');
  expect(empty.summaries.every(row => row.accuracy === null)).toBe(true);
});
it('removes a missing outcome from every model denominator', () => {
  const history = arenaHistorySchema.parse(JSON.parse(readFileSync('public/data/arena_history.json', 'utf8'))).data;
  const before = arenaCohort(history).eligible.length;
  history.races[0].outcomeWinner = null;
  const result = arenaCohort(history);
  expect(result.eligible.length).toBe(before - 1);
  expect(result.excluded.some(row => row.reasons.includes('Outcome winner unavailable'))).toBe(true);
});
