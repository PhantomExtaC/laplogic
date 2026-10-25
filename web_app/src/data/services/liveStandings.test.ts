import { afterEach, expect, it, vi } from 'vitest';
import { getDriverStandingsResource, getDriverStandings } from './directories';
import { legacyMeta } from '../adapters';
afterEach(() => vi.unstubAllGlobals());
it('retains live standings provenance and permits an unavailable number', async () => {
 const payload = { meta: { ...legacyMeta, schemaVersion: '1.0.0', snapshotId: 'live-test', season: 2026, round: 17, generatedAt: '2026-10-25T00:00:00Z', dataThrough: '2026-10-11' }, data: [{ id: 'driver', position: 1, points: 0, wins: 0, nationality: 'Test', imagePath: '', driverName: 'Fixture', driverNumber: null, currentTeamId: null }] };
 vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => payload }));
 expect((await getDriverStandingsResource()).meta).toEqual(payload.meta);
 expect((await getDriverStandings())[0].points).toBe(0);
 expect((await getDriverStandings())[0].driverNumber).toBeNull();
});
