export interface SimulationInput { snapshotId: string; driverId: string; gridPenalty: number }
export interface SimulationResult extends SimulationInput {
  raceId: string; eventName: string; baseline: { driverId: string; driverName: string; probability: number }[];
  scenario: { driverId: string; driverName: string; probability: number }[];
  deltasPp: { driverId: string; value: number }[];
  modelId: string; modelVersion: string; assumptions: string[]; generatedAt: string; placeholder: boolean;
}
export interface SimulationProvider { run(input: SimulationInput & { signal: AbortSignal }): Promise<SimulationResult> }
