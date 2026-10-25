import { Surface } from '../../ui/Surface';
export default function RaceCard({ grandPrix, date, country, weather }: { grandPrix: string; date: string; country: string; weather: string }) {
  return <Surface title={grandPrix}><p className="font-mono">{date}</p><p className="mt-2 text-text-muted">{country}</p><p className="mt-2 text-text-muted">{weather}</p><p className="mt-3 text-xs text-text-muted">Snapshot and forecast freshness unverified</p></Surface>;
}
