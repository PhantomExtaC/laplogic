import { z } from 'zod';
import { envelope } from './index';
import { stageSchema } from './core';
const n = z.number().finite();
const id = z.string().regex(/^[a-zA-Z0-9_-]+$/);
const pick = z.object({ modelId: z.string(), modelVersion: z.string().nullable().default(null), predictedWinner: z.string().nullable(), winProbability: n.min(0).max(1).nullable() });
export const arenaHistorySchema = envelope(z.object({
  evaluationId: z.string(), baselineId: z.string(), modelIds: z.array(z.string()).min(1),
  races: z.array(z.object({ raceId: z.string(), eventName: z.string(), season: n.int(), round: n.int().positive(), stage: stageSchema,
    snapshotId: id, outcomeId: id, outcomeWinner: z.string().nullable(),
    results: z.array(pick.extend({ eligible: z.boolean(), correct: z.boolean().nullable(), top3Covered: z.boolean().nullable(), exclusionReason: z.string().nullable() })),
  })),
}));
export const frozenSnapshotSchema = envelope(z.object({ snapshotId: id, evaluationId: z.string(), raceId: z.string(), eventName: z.string(), season: n.int(), round: n.int(), stage: stageSchema, frozenAt: z.string(), predictions: z.array(pick) }));
export const outcomeSchema = envelope(z.object({ outcomeId: id, raceId: z.string(), eventName: z.string(), winnerId: z.string().nullable(), recordedAt: z.string() }));
const metric = z.object({ raw: n.nullable(), normalized: n.min(0).max(100).nullable(), sampleCount: n.int().nonnegative(), minimumSamples: n.int().positive(), higherIsBetter: z.boolean().nullable(), unit: z.string() });
export const comparisonSchema = envelope(z.object({ season: n.int(), metricDefinitions: z.record(z.string(), z.string()),
  drivers: z.array(z.object({ driverId: z.string(), metrics: z.record(z.string(), metric), tracks: z.array(z.object({ trackId: z.string(), metrics: z.record(z.string(), metric) })) })),
}));
export const archiveIdSchema = id;
