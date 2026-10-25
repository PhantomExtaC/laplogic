import type { DataMeta } from '../types/resource';
import type { RaceEvent } from '../types/core';

export function sameSnapshot(a: DataMeta, b: DataMeta) {
  return a.raceId !== null && a.snapshotId !== null && a.raceId === b.raceId && a.snapshotId === b.snapshotId;
}
export function eventMatches(meta: DataMeta, event: RaceEvent | null) {
  return !!event && meta.raceId !== null && meta.raceId === event.raceId;
}
export function eventTiming(event: RaceEvent, now: Date) {
  if (!event.startsAt) return { label: 'Session start time unavailable', seconds: null };
  const seconds = Math.ceil((Date.parse(event.startsAt) - now.getTime()) / 1000);
  if (!Number.isFinite(seconds)) return { label: 'Session start time unavailable', seconds: null };
  return { label: seconds <= 0 ? 'Scheduled start reached' : `${Math.floor(seconds / 86400)}d ${Math.floor(seconds % 86400 / 3600)}h until start`, seconds };
}
export function displaySession(instant: string | null, timezone: string | null) {
  if (!instant) return 'Time unavailable';
  try { return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', ...(timezone ? { timeZone: timezone } : {}) }).format(new Date(instant)); }
  catch { return 'Time or timezone unavailable'; }
}
