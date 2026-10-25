import type { RaceEvent } from '../domain/types/core';
import { displaySession, eventTiming } from '../domain/logic/snapshots';
import { Badge } from './Indicators';

export function RaceContext({ event, now = new Date() }: { event: RaceEvent | null; now?: Date }) {
  if (!event) return <p className="text-text-muted">No future or ongoing event found in this export. This does not confirm season completion.</p>;
  return <div className="space-y-4"><p className="kicker">{event.season} / Round {event.round}</p>
    <h3 className="text-[28px] font-semibold tracking-tight">{event.grandPrix}</h3>
    <p className="font-mono text-sm text-text-muted">{event.date}</p><Badge>{event.status.replace('_', ' ')}</Badge>
    <p className="text-sm text-text-muted">{eventTiming(event, now).label}</p>
    <dl className="space-y-2 text-xs"><div><dt className="text-text-muted">Event ID</dt><dd className="font-mono">{event.raceId}</dd></div><div><dt className="text-text-muted">Forecast freshness</dt><dd>Unavailable until an event-bound weather export is supplied.</dd></div></dl>
    {event.sessions.length > 0 ? <ul className="space-y-2 text-sm">{event.sessions.map(session => <li key={session.name}>{session.name} / {displaySession(session.startsAt, event.timezone)}</li>)}</ul> : <p className="text-xs text-text-muted">Session and sprint timings are not supplied.</p>}
  </div>;
}
