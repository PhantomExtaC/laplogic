import {describe,it,expect} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import * as s from './schemas';
import {nextEvent,probabilityCoverage,formatLapTime,pairwiseMatchups,formatPpDelta} from '../domain/logic';
import {lapSeconds,resolveDriver} from './adapters';
const schemas={manifest:s.manifestSchema,driver_registry:s.registrySchema,track_registry:s.trackRegistrySchema,evaluation:s.evaluationSchema,asset_manifest:s.assetSchema,calendar:s.calendarSchema,predictions:s.predictionsSchema,drivers:s.driversSchema,teams:s.teamsSchema,tracks:s.tracksSchema,driver_standings:s.driverStandingsSchema,constructor_standings:s.constructorStandingsSchema,pointsProgression:s.progressionSchema,weekend_state:s.weekendSchema,evaluation_metrics:s.legacyEvaluationSchema,arena_metrics:s.arenaSchema,driverTrends:s.trendsSchema,insights:s.insightsSchema,tracksDeg:s.degradationSchema,stats:s.statsSchema,next_race:s.nextRaceSchema};
const raw=(name:string):unknown=>JSON.parse(readFileSync(resolve('public/data',`${name}.json`),'utf8'));
describe('shipped contracts',()=>{
 for(const [name,schema] of Object.entries(schemas))it(name,()=>{expect(()=>schema.parse(raw(name))).not.toThrow();});
 it('covers every shipped JSON',()=>expect(readdirSync('public/data').filter(n=>n.endsWith('.json')).sort()).toEqual(Object.keys(schemas).map(n=>`${n}.json`).sort()));
 it('resolves prediction and telemetry IDs',()=>{const registry=s.registrySchema.parse(raw('driver_registry')).data;for(const row of [...s.predictionsSchema.parse(raw('predictions')),...s.weekendSchema.parse(raw('weekend_state')).telemetry.longRunPace])expect(resolveDriver(row.driverId,registry)).toBeTruthy();});
});
describe('domain',()=>{
 it('preserves raw mass and real zero',()=>{expect(probabilityCoverage([{winProbability:0},{winProbability:0.61}])).toEqual({count:2,mass:0.61,massMissing:0.39});expect(s.predictionsSchema.safeParse([{driverId:'x',driverName:'X',winProbability:2,predictedPosition:1}]).success).toBe(false);});
 it('does not multiply mislabeled seconds',()=>expect(formatLapTime(lapSeconds({milliseconds:69.593}))).toBe('1:09.593'));
 it('formats missing lap and deltas',()=>{expect(formatLapTime(null)).toBe('—');expect(formatPpDelta(0,0)).toBe('+0.0 pp');expect(pairwiseMatchups(22)).toBe(231);});
 it('sorts events and excludes cancelled, postponed and completed',()=>{const rows=[{round:3,date:'2026-11-03',status:'upcoming'},{round:1,date:'2026-11-01',status:'cancelled'},{round:2,date:'2026-11-02',status:'upcoming'}];expect(nextEvent(rows,new Date('2026-10-25'))?.round).toBe(2);expect(nextEvent(rows,new Date('2027-01-01'))).toBeNull();});
 it('rejects unknown aliases',()=>expect(()=>resolveDriver('missing',[])).toThrow());
});
