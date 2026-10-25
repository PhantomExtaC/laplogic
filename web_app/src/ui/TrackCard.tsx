import type { Track } from '../domain/types/directories';
import { Surface } from './Surface';
import { Avatar } from './Avatar';
import { Num } from './Indicators';
export default function TrackCard({ track }: { track: Track }) {
  return <Surface><p className="kicker mb-3">Directory / season unverified</p><Avatar src={track.layout ?? '/images/tracks/placeholderTracks.webp'} name={track.name} className="mb-5 h-40 w-full" /><h2 className="text-xl font-semibold">{track.name}</h2><p className="mt-1 text-sm text-text-muted">{track.city}, {track.country}</p><dl className="mt-5 space-y-3 border-t border-line pt-4 text-sm">
    <div className="flex justify-between gap-4"><dt className="text-text-muted">Length</dt><dd><Num value={track.lengthKm} digits={3} unit="km" /></dd></div>
    <div className="flex justify-between gap-4"><dt className="text-text-muted">Turns</dt><dd><Num value={track.corners} /></dd></div>
    <div><dt className="text-text-muted">Lap record</dt><dd>{track.lapRecord ? `${track.lapRecord.time} / ${track.lapRecord.driver} / ${track.lapRecord.year}` : <span aria-label="Unavailable">—</span>}</dd></div>
    <div><dt className="text-text-muted">First Grand Prix</dt><dd>{track.firstGrandPrix ?? '—'}</dd></div><div><dt className="text-text-muted">Last Grand Prix</dt><dd>{track.lastGrandPrix ?? '—'}</dd></div>
  </dl><p className="mt-4 text-xs text-text-muted">Historical directory · current-calendar membership unverified</p><p className="mt-4 text-xs text-text-muted">Directory as-of unavailable</p></Surface>;
}
