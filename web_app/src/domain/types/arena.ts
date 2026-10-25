import type { Stage } from './core';
export interface ArenaResult {
  modelId: string; predictedWinner: string | null; winProbability: number | null;
  eligible: boolean; correct: boolean | null; top3Covered: boolean | null; exclusionReason: string | null;
}
export interface ArenaRace {
  raceId: string; eventName: string; season: number; round: number; stage: Stage;
  snapshotId: string; outcomeId: string; outcomeWinner: string | null; results: ArenaResult[];
}
export interface ArenaHistory { evaluationId: string; baselineId: string; modelIds: string[]; races: ArenaRace[] }
