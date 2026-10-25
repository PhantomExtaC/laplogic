import { z } from 'zod';
import { envelope } from './index';
const probability = z.object({ driverId: z.string(), driverName: z.string(), probability: z.number().min(0).max(1) });
export const simulationResultSchema = z.object({
  snapshotId: z.string(), raceId: z.string(), eventName: z.string(), driverId: z.string(), gridPenalty: z.number().int().min(0).max(10),
  baseline: z.array(probability).min(1), scenario: z.array(probability).min(1),
  deltasPp: z.array(z.object({ driverId: z.string(), value: z.number().finite() })),
  modelId: z.string(), modelVersion: z.string(), assumptions: z.array(z.string()).min(1), generatedAt: z.iso.datetime({ offset: true }), placeholder: z.boolean(),
}).superRefine((result, ctx) => {
  const ids = result.baseline.map(row => row.driverId);
  if (new Set(ids).size !== ids.length || !ids.includes(result.driverId) || result.scenario.length !== ids.length || result.deltasPp.length !== ids.length) ctx.addIssue({ code: 'custom', message: 'Invalid field coverage' });
  for (const baseline of result.baseline) {
    const scenario = result.scenario.filter(row => row.driverId === baseline.driverId), delta = result.deltasPp.filter(row => row.driverId === baseline.driverId);
    if (scenario.length !== 1 || delta.length !== 1 || Math.abs((scenario[0].probability - baseline.probability) * 100 - delta[0].value) > 0.0001) ctx.addIssue({ code: 'custom', message: 'Scenario/delta IDs or pp units disagree' });
    if (result.gridPenalty === 0 && scenario[0]?.probability !== baseline.probability) ctx.addIssue({ code: 'custom', message: 'Zero penalty must restore baseline' });
  }
});
export const simulatorSchema = envelope(z.object({
  events: z.array(z.object({ snapshotId: z.string(), raceId: z.string(), eventName: z.string() })).min(1),
  drivers: z.array(z.object({ driverId: z.string(), driverName: z.string() })).min(1), scenarios: z.array(simulationResultSchema),
}));
