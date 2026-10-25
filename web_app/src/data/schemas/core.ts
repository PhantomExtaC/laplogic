import { z } from 'zod';
import { envelope, predictionsSchema } from './index';
const n = z.number().finite();
export const stageSchema = z.enum(['pre-weekend', 'post-fp2', 'post-quali']);
export const momentumSchema = envelope(z.object({
  definition: z.string(), drivers: z.array(z.object({
    driverId: z.string(), points: z.array(z.object({
      raceId: z.string(), round: n.int().positive(), momentum: n.nullable(), racecraft: n.nullable(),
      delta: n.nullable(), direction: z.enum(['up', 'down', 'flat', 'unknown']),
    })).max(5),
  })),
}));
export const seasonStatsSchema = envelope(z.object({
  season: n.int().nullable(), seasonEntrants: n.int().nonnegative(), currentLineup: n.int().nonnegative(),
  teams: n.int().nonnegative(), scheduledEvents: n.int().nonnegative(), uniqueCircuits: n.int().nonnegative().nullable(),
  completedRaces: n.int().nonnegative(), scope: z.string(),
}));
export const stagesSchema = envelope(z.object({
  raceId: z.string(), eventName: z.string(), fieldSize: n.int().positive(), stages: z.array(z.object({
    stage: stageSchema, snapshotId: z.string(), modelId: z.string(), modelVersion: z.string(),
    generatedAt: z.string(), predictions: predictionsSchema,
  })).min(1),
}));
