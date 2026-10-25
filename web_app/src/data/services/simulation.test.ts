import { afterEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { PlaceholderSimulationProvider } from './simulation';
import { simulatorSchema } from '../schemas/simulation';
const raw: unknown = JSON.parse(readFileSync('public/data/simulator_scenarios.json', 'utf8'));
afterEach(() => vi.unstubAllGlobals());
it('looks up an exact fixture and explicitly rejects unsupported input', async () => {
 vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => raw }));
 const provider = new PlaceholderSimulationProvider(), result = simulatorSchema.parse(raw).data.scenarios[0];
 const input = { snapshotId: result.snapshotId, driverId: result.driverId, gridPenalty: result.gridPenalty, signal: new AbortController().signal };
 expect(await provider.run(input)).toEqual(result);
 await expect(provider.run({ ...input, driverId: 'unavailable' })).rejects.toThrow('unavailable in sample mode');
 await expect(provider.run({ ...input, gridPenalty: 11 })).rejects.toThrow('unavailable in sample mode');
});
