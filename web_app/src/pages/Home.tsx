import SectionCard from '../components/cards/SectionCard';
import EvaluationCard from '../components/cards/EvaluationCard';
import StandingsTable from '../components/cards/StandingsTable';
import {PointsProgressChart} from '../components/charts/PointsProgressChart';
import {useResource} from '../data/hooks/useResource';
import {getCalendarResource} from '../data/services';
import {getDriverStandings,getConstructorStandings} from '../services/standings';
import {getPointsProgression} from '../services/progression';
import {legacy} from '../data/adapters';
import {nextEvent} from '../domain/logic';
import {ResourceBoundary} from '../ui/ResourceBoundary';
import {PredictionResource} from '../ui/PredictionResource';
const loadDrivers=async(signal:AbortSignal)=>legacy(await getDriverStandings(signal));
const loadTeams=async(signal:AbortSignal)=>legacy(await getConstructorStandings(signal));
const loadProgression=async(signal:AbortSignal)=>legacy(await getPointsProgression(signal));
export default function Home(){
 const calendar=useResource(getCalendarResource),drivers=useResource(loadDrivers),teams=useResource(loadTeams),progression=useResource(loadProgression);
 return <div className="mx-auto max-w-7xl space-y-8 p-6"><header><p className="text-sm uppercase tracking-widest text-red-400">LapLogic / Analytics</p><h1 className="mt-3 text-4xl font-bold">The prediction desk</h1><p className="mt-3 text-neutral-400">Published model outputs, with their limits in view.</p></header>
 <SectionCard title="Prediction preview Â· event unverified"><PredictionResource/></SectionCard>
 <SectionCard title="Race context"><ResourceBoundary state={calendar}>{rows=>{const event=nextEvent(rows,new Date());return event?<><h2 className="text-2xl">{event.grandPrix}</h2><p>Round {event.round} Â· {event.date} Â· {event.status}</p></>:<p>No future or ongoing event at the current date. Export freshness is unverified.</p>;}}</ResourceBoundary></SectionCard>
 <EvaluationCard/>
 <div className="grid gap-6 lg:grid-cols-2"><SectionCard title="Driver standings"><ResourceBoundary state={drivers}>{rows=><StandingsTable title="Driver championship" rows={rows.map(row=>({...row,name:row.driverName}))}/>}</ResourceBoundary></SectionCard><SectionCard title="Constructor standings"><ResourceBoundary state={teams}>{rows=><StandingsTable title="Constructor championship" rows={rows.map(row=>({...row,name:row.teamName}))}/>}</ResourceBoundary></SectionCard></div>
 <SectionCard title="Points progression"><ResourceBoundary state={progression}>{rows=><PointsProgressChart data={[...rows].sort((a,b)=>a.round-b.round)}/>}</ResourceBoundary></SectionCard></div>;
}
