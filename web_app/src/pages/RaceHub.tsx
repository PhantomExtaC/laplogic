import { Surface, SectionHeader } from '../ui/Surface';
import { useResource } from '../data/hooks/useResource';
import { getCalendarResource, getWeekendResource, getPredictionsResource } from '../data/services';
import { nextEvent, probabilityCoverage } from '../domain/logic';
import { ResourceBoundary } from '../ui/ResourceBoundary';
import { PredictionPanel } from '../ui/PredictionPanel';
import { StaleBanner } from '../ui/States';
import { Badge } from '../ui/Indicators';

export default function RaceHub() {
  const calendar = useResource(getCalendarResource), weekend = useResource(getWeekendResource), predictions = useResource(getPredictionsResource);
  return <div className="page space-y-6"><SectionHeader title="Race Hub" level={1} kicker="LapLogic / Race context" asOf="Event-bound analysis starts with a verified snapshot." actions={<Badge tone="warning">Provenance required</Badge>} />
    <StaleBanner>Combined weather, telemetry and predictions are suppressed. Legacy exports contain no event or snapshot IDs to establish that they belong together.</StaleBanner>
    <div className="grid items-start gap-6 lg:grid-cols-2"><Surface title="Scheduled event" kicker="Calendar"><ResourceBoundary state={calendar}>{rows => {
      const event = nextEvent(rows, new Date());
      return event ? <div className="space-y-2"><h3 className="text-[28px] font-semibold">{event.grandPrix}</h3><p className="font-mono text-sm text-text-muted">Round {event.round} / {event.date}</p></div> : <p className="text-text-muted">No future or ongoing scheduled event at the current date.</p>;
    }}</ResourceBoundary></Surface><Surface title="Weekend export status" kicker="Weather & telemetry"><ResourceBoundary state={weekend}>{() => <p className="text-text-muted">Export parsed successfully. Weather and telemetry are withheld until event, snapshot and session provenance are supplied.</p>}</ResourceBoundary></Surface></div>
    <Surface title="Unbound prediction archive" kicker="Published probabilities" variant="accent"><ResourceBoundary state={predictions}>{rows => <PredictionPanel rows={rows.map(row => ({ id: row.driverId, label: row.driverName, probability: row.winProbability }))} coverage={probabilityCoverage(rows)} />}</ResourceBoundary></Surface>
  </div>;
}
