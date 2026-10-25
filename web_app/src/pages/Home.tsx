import { Link } from 'react-router-dom';
import EvaluationCard from '../components/cards/EvaluationCard';
import StandingsTable from '../components/cards/StandingsTable';
import { LineTrendChart } from '../charts/LineTrendChart';
import { useResource } from '../data/hooks/useResource';
import { getCalendarResource, getPredictionsResource, getProgressionResource } from '../data/services';
import { getDriverStandings, getConstructorStandings } from '../services/standings';
import { legacy } from '../data/adapters';
import { nextEvent, probabilityCoverage } from '../domain/logic';
import { ResourceBoundary } from '../ui/ResourceBoundary';
import { PredictionPanel } from '../ui/PredictionPanel';
import { Surface, SectionHeader } from '../ui/Surface';
import { Badge } from '../ui/Indicators';
import { ArrowUpRight } from 'lucide-react';
const loadDrivers = async (signal: AbortSignal) => legacy(await getDriverStandings(signal));
const loadTeams = async (signal: AbortSignal) => legacy(await getConstructorStandings(signal));

export default function Home() {
  const calendar = useResource(getCalendarResource);
  const predictions = useResource(getPredictionsResource);
  const drivers = useResource(loadDrivers);
  const teams = useResource(loadTeams);
  const progression = useResource(getProgressionResource);
  return <div className="page space-y-6">
    <SectionHeader title="The prediction desk" level={1} kicker="LapLogic / Overview" asOf="Published model outputs, with their limits in view." actions={<Badge>Static exports</Badge>} />
    <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
      <Surface title="Race win probabilities" kicker="Prediction archive" variant="accent" actions={<Link to="/race-hub" className="inline-flex min-h-11 items-center gap-1 text-xs text-text-muted hover:text-text">Race Hub<ArrowUpRight size={16} aria-hidden="true" /></Link>}>
        <ResourceBoundary state={predictions}>{rows => <PredictionPanel rows={rows.map(row => ({ id: row.driverId, label: row.driverName, probability: row.winProbability }))} coverage={probabilityCoverage(rows)} />}</ResourceBoundary>
      </Surface>
      <div className="space-y-6"><Surface title="Race context" kicker="Calendar desk"><ResourceBoundary state={calendar}>{rows => {
        const event = nextEvent(rows, new Date());
        return event ? <div className="space-y-3"><p className="kicker">Round {event.round}</p><h3 className="text-[28px] font-semibold tracking-tight">{event.grandPrix}</h3><p className="font-mono text-sm text-text-muted">{event.date}</p><Badge>{event.status.replace('_', ' ')}</Badge></div> : <p className="text-sm text-text-muted">No future or ongoing event at the current date. Export freshness remains unverified.</p>;
      }}</ResourceBoundary></Surface><EvaluationCard /></div>
    </div>
    <SectionHeader title="Championship desk" kicker="Standings & progression" asOf="Standings and directory totals can have different scopes and as-of dates." />
    <div className="grid gap-6 lg:grid-cols-2"><Surface title="Driver championship"><ResourceBoundary state={drivers}>{rows => <StandingsTable title="Driver championship" rows={rows.map(row => ({ ...row, name: row.driverName }))} />}</ResourceBoundary></Surface><Surface title="Constructor championship"><ResourceBoundary state={teams}>{rows => <StandingsTable title="Constructor championship" rows={rows.map(row => ({ ...row, name: row.teamName }))} />}</ResourceBoundary></Surface></div>
    <Surface title="Points progression" kicker="Recorded championship points"><ResourceBoundary state={progression}>{data => <LineTrendChart points={data.points} series={data.series} summary="Points by completed round. Six drivers are initially shown, ranked by the latest observation." />}</ResourceBoundary></Surface>
  </div>;
}
