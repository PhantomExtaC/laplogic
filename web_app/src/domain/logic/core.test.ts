import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { legacyMeta } from '../../data/adapters';
import { sameSnapshot, eventMatches, eventTiming, displaySession } from './snapshots';
import { getCalendarResource } from '../../data/services';
import { nextEvent } from './index';
import { vi, afterEach } from 'vitest';

afterEach(() => vi.unstubAllGlobals());

it('never treats two missing snapshots as a match', () => {
  expect(sameSnapshot(legacyMeta, legacyMeta)).toBe(false);
  const bound = { ...legacyMeta, raceId: 'event-a', snapshotId: 'snapshot-a' };
  expect(sameSnapshot(bound, { ...bound })).toBe(true);
  expect(sameSnapshot(bound, { ...bound, raceId: 'event-b' })).toBe(false);
  expect(sameSnapshot(bound, { ...bound, snapshotId: 'snapshot-b' })).toBe(false);
});

it('adapts calendar IDs without inventing tracks and selects the same event for both consumers', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(readFileSync('public/data/calendar.json', 'utf8'))));
  const result = await getCalendarResource();
  const now = new Date('2026-10-25T12:00:00Z');
  const home = nextEvent(result.data, now), hub = nextEvent(result.data, now);
  expect(home?.raceId).toBe(hub?.raceId);
  expect(home?.raceId).toBe('2026-r18');
  const tracks = JSON.parse(readFileSync('public/data/tracks.json', 'utf8')) as { id: string }[];
  expect(result.data.filter(row => row.trackId !== null).length).toBeGreaterThan(0);
  expect(result.data.every(row => row.trackId === null || tracks.some(track => track.id === row.trackId))).toBe(true);
  expect(home && eventMatches({ ...legacyMeta, raceId: home.raceId }, home)).toBe(true);
  if (home?.startsAt) expect(eventTiming(home, now).seconds).not.toBeNull();
});

it('does not manufacture timezone instants from dates or invalid input', () => {
  expect(displaySession(null, 'Asia/Kolkata')).toBe('Time unavailable');
  expect(displaySession('invalid', null)).toBe('Time or timezone unavailable');
});
