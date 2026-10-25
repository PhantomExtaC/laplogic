import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useSnapshot } from '../../data/hooks/useSnapshot';
import { usePredictions, useEvaluation, useSeasonStats, useDriverStandings, useTeamStandings, useProgression } from '../../data/hooks/resources';
import { probabilityCoverage } from '../../domain/logic';
import { eventMatches } from '../../domain/logic/snapshots';
import { Surface, SectionHeader } from '../../ui/Surface';
import { ResourceBoundary } from '../../ui/ResourceBoundary';
import { PredictionPanel } from '../../ui/PredictionPanel';
import { RaceContext } from '../../ui/RaceContext';
import { EvaluationSummary } from '../../ui/EvaluationSummary';
import { SeasonStats } from '../../ui/SeasonStats';
import StandingsTable from '../../ui/StandingsTable';
import { Badge } from '../../ui/Indicators';
import { LineTrendChart } from '../../charts/LineTrendChart';

export default function HomePage() {
  const { calendar, event } = useSnapshot();
  const predictions = usePredictions(), evaluation = useEvaluation();
  const stats = useSeasonStats(), drivers = useDriverStandings(), teams = useTeamStandings(), progression = useProgression();
  return <div className="page space-y-6">
    <SectionHeader title="The prediction desk" level={1} kicker="LapLogic / Overview" />
    <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
      <Surface title="Leading win probabilities" kicker="Model prediction" variant="accent" actions={<Link to="/race-hub" className="button text-xs">Race Hub <ArrowUpRight size={16} aria-hidden="true" /></Link>}>
        <ResourceBoundary state={predictions}>{rows => <div className="space-y-5">
          <Badge tone={predictions.status === 'ready' && eventMatches(predictions.meta, event) ? 'success' : 'warning'}>{predictions.status === 'ready' && eventMatches(predictions.meta, event) ? 'EVENT MATCHED' : 'UNBOUND EXPORT'}</Badge>
          <p className="text-xs text-text-muted">Model: {predictions.status === 'ready' ? predictions.meta.modelId ?? 'Unavailable' : 'Unavailable'} / Version: {predictions.status === 'ready' ? predictions.meta.modelVersion ?? 'Unavailable' : 'Unavailable'} / Stage: {predictions.status === 'ready' ? predictions.meta.stage ?? 'Unverified' : 'Unverified'}</p>
          <PredictionPanel rows={[...rows].sort((a, b) => b.winProbability - a.winProbability).slice(0, 3).map(row => ({ id: row.driverId, label: row.driverName, probability: row.winProbability }))} coverage={probabilityCoverage(rows)} fieldSize={predictions.status === 'ready' ? predictions.meta.fieldSize : null} />
          <p className="text-xs text-text-muted">Champion and event binding await verification.</p>
        </div>}</ResourceBoundary>
      </Surface>
      <Surface title="Next race context" kicker="Calendar"><ResourceBoundary state={calendar}>{() => <RaceContext event={event} />}</ResourceBoundary></Surface>
    </div>
    <Surface title="Model arena" kicker="Evaluation desk" actions={<Link to="/arena" className="button text-xs">Open Arena <ArrowUpRight size={16} aria-hidden="true" /></Link>}><ResourceBoundary state={evaluation}>{data => <EvaluationSummary evaluation={data} />}</ResourceBoundary></Surface>
    <Surface title="Season scope" kicker="Export-derived counts"><ResourceBoundary state={stats}>{data => <SeasonStats data={data} />}</ResourceBoundary></Surface>
    <SectionHeader title="Championship desk" kicker="Standings & progression" />
    <div className="grid gap-6 lg:grid-cols-2"><Surface title="Driver championship"><ResourceBoundary state={drivers}>{rows => <StandingsTable title="Driver championship" rows={rows.map(row => ({ ...row, name: row.driverName }))} />}</ResourceBoundary></Surface><Surface title="Constructor championship"><ResourceBoundary state={teams}>{rows => <StandingsTable title="Constructor championship" rows={rows.map(row => ({ ...row, name: row.teamName }))} />}</ResourceBoundary></Surface></div>
    <Surface title="Points progression" kicker="Recorded observations"><ResourceBoundary state={progression}>{data => <LineTrendChart points={data.points} series={data.series} summary="Points by round. Showing the six leading drivers." />}</ResourceBoundary></Surface>
  </div>;
}
