import {describe,it,expect} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import * as s from './schemas';
import { simulatorSchema } from './schemas/simulation';
import { storySchema, storyIndexSchema } from './schemas/stories';
import {arenaHistorySchema,comparisonSchema,frozenSnapshotSchema,outcomeSchema} from './schemas/arena';
import {momentumSchema,seasonStatsSchema,stagesSchema,trackProfilesSchema} from './schemas/core';
import {nextEvent,probabilityCoverage,formatLapTime,pairwiseMatchups,formatPpDelta} from '../domain/logic';
import {lapSeconds,resolveDriver} from './adapters';
const schemas={track_profiles:trackProfilesSchema,simulator_scenarios:simulatorSchema,arena_history:arenaHistorySchema,head_to_head:comparisonSchema,momentum:momentumSchema,season_stats:seasonStatsSchema,prediction_stages:stagesSchema,manifest:s.manifestSchema,driver_registry:s.registrySchema,track_registry:s.trackRegistrySchema,evaluation:s.evaluationSchema,asset_manifest:s.assetSchema,calendar:s.calendarResourceSchema,predictions:s.envelope(s.predictionsSchema),drivers:s.driversSchema,teams:s.teamsSchema,tracks:s.tracksSchema,driver_standings:s.driverStandingsResourceSchema,constructor_standings:s.constructorStandingsResourceSchema,pointsProgression:s.progressionSchema,weekend_state:s.weekendSchema,evaluation_metrics:s.legacyEvaluationSchema,arena_metrics:s.arenaSchema,driverTrends:s.trendsSchema,insights:s.insightsSchema,tracksDeg:s.degradationSchema,stats:s.statsSchema,next_race:s.nextRaceSchema};
const raw=(name:string):unknown=>JSON.parse(readFileSync(resolve('public/data',`${name}.json`),'utf8'));
describe('shipped contracts',()=>{
 for(const [name,schema] of Object.entries(schemas))it(name,()=>{expect(()=>schema.parse(raw(name))).not.toThrow();});
 it('covers every shipped JSON',()=>expect(readdirSync('public/data').filter(n=>n.endsWith('.json')).sort()).toEqual(Object.keys(schemas).map(n=>`${n}.json`).sort()));
 it('does not leave new JSON subfolders outside contract coverage', () => {
  const shipped = readdirSync('public/data', { recursive: true }).filter(name => typeof name === 'string' && name.endsWith('.json')).map(name => String(name).replaceAll('\\', '/'));
  expect(shipped.filter(name => name.includes('/') && !/^(snapshots|outcomes|stories)\/[^/]+\.json$/.test(name))).toEqual([]);
 });
 it('resolves prediction and telemetry IDs',()=>{const registry=s.registrySchema.parse(raw('driver_registry')).data;for(const row of [...s.envelope(s.predictionsSchema).parse(raw('predictions')).data,...s.weekendSchema.parse(raw('weekend_state')).telemetry.longRunPace])expect(resolveDriver(row.driverId,registry)).toBeTruthy();});
});
describe('domain',()=>{
 it('preserves raw mass and real zero',()=>{expect(probabilityCoverage([{winProbability:0},{winProbability:0.61}])).toEqual({count:2,mass:0.61,massMissing:0.39});expect(s.predictionsSchema.safeParse([{driverId:'x',driverName:'X',winProbability:2,predictedPosition:1}]).success).toBe(false);});
 it('does not multiply mislabeled seconds',()=>expect(formatLapTime(lapSeconds({milliseconds:69.593}))).toBe('1:09.593'));
 it('formats missing lap and deltas',()=>{expect(formatLapTime(null)).toBe('—');expect(formatPpDelta(0,0)).toBe('+0.0 pp');expect(pairwiseMatchups(22)).toBe(231);});
 it('sorts events and excludes cancelled, postponed and completed',()=>{const rows=[{round:3,date:'2026-11-03',status:'upcoming'},{round:1,date:'2026-11-01',status:'cancelled'},{round:2,date:'2026-11-02',status:'upcoming'}];expect(nextEvent(rows,new Date('2026-10-25'))?.round).toBe(2);expect(nextEvent(rows,new Date('2027-01-01'))).toBeNull();});
 it('rejects unknown aliases',()=>expect(()=>resolveDriver('missing',[])).toThrow());
});

describe('immutable archive contracts', () => {
 for (const [folder, schema] of [['snapshots', frozenSnapshotSchema], ['outcomes', outcomeSchema]] as const) {
  for (const file of readdirSync(`public/data/${folder}`).filter(name => name.endsWith('.json'))) {
   it(`${folder}/${file}`, () => {
    const payload: unknown = JSON.parse(readFileSync(`public/data/${folder}/${file}`, 'utf8'));
    expect(() => schema.parse(payload)).not.toThrow();
   });
  }
 }
 it('history points to frozen picks and matching outcomes', () => {
  const history = arenaHistorySchema.parse(raw('arena_history'));
  const registry = s.registrySchema.parse(raw('driver_registry')).data;
  for (const row of history.data.races) {
   const frozen = frozenSnapshotSchema.parse(JSON.parse(readFileSync(`public/data/snapshots/${row.snapshotId}.json`, 'utf8')));
   const outcome = outcomeSchema.parse(JSON.parse(readFileSync(`public/data/outcomes/${row.outcomeId}.json`, 'utf8')));
   expect(frozen.meta.snapshotId).toBe(row.snapshotId);
   expect(frozen.data.raceId).toBe(row.raceId);
   expect(outcome.data.raceId).toBe(row.raceId);
   expect(outcome.data.winnerId).toBe(row.outcomeWinner);
   for (const result of row.results) {
    expect(frozen.data.predictions.find(pick => pick.modelId === result.modelId)?.predictedWinner).toBe(result.predictedWinner);
    if (result.predictedWinner !== null) expect(resolveDriver(result.predictedWinner, registry)).toBe(result.predictedWinner);
    if (result.eligible) expect(result.correct).toBe(result.predictedWinner === outcome.data.winnerId);
   }
  }
 });
});


describe('simulator and story archive contracts', () => {
 it('checks every fixture identity, event binding, delta and zero-penalty baseline', () => {
  const fixture = simulatorSchema.parse(raw('simulator_scenarios'));
  const registry = s.registrySchema.parse(raw('driver_registry')).data;
  const keys = fixture.data.scenarios.map(row => `${row.snapshotId}/${row.driverId}/${row.gridPenalty}`);
  expect(new Set(keys).size).toBe(keys.length);
  for (const row of fixture.data.scenarios) {
   expect(fixture.data.events.find(event => event.snapshotId === row.snapshotId)?.raceId).toBe(row.raceId);
   expect(row.placeholder).toBe(fixture.meta.placeholder);
   for (const driver of row.baseline) expect(resolveDriver(driver.driverId, registry)).toBe(driver.driverId);
  }
 });
 const index = storyIndexSchema.parse(raw('stories/index'));
 it('covers every story JSON', () => expect(readdirSync('public/data/stories').filter(file => file.endsWith('.json')).sort()).toEqual(['index.json', ...index.data.map(story => `${story.id}.json`)].sort()));
 for (const header of index.data) it(`stories/${header.id}`, () => {
  const story = storySchema.parse(raw(`stories/${header.id}`));
  for (const key of Object.keys(header) as (keyof typeof header)[]) expect(story.data[key]).toEqual(header[key]);
  const frozen = frozenSnapshotSchema.parse(raw(`snapshots/${story.data.snapshotId}`));
  expect(frozen.data.raceId).toBe(story.data.raceId);
  const model = frozen.data.predictions.find(model => model.modelId === story.data.modelId);
  expect(model).toBeDefined();
  expect(model?.modelVersion ?? null).toBe(story.data.modelVersion);
  for (const block of story.data.blocks) if (block.type === 'audit') expect(outcomeSchema.parse(raw(`outcomes/${block.outcomeId}`)).data.raceId).toBe(story.data.raceId);
 });
});
