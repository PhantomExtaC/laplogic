import { Surface } from '../../ui/Surface';
import { Num, ProgressBar } from '../../ui/Indicators';
export default function PredictionCard({ winner, probability }: { winner: string; probability: number }) {
  return <Surface title="Published prediction"><p className="mb-3 text-xl">{winner}</p><p className="mb-4"><Num value={probability * 100} digits={1} unit="%" /></p><ProgressBar label={`${winner} win probability`} value={probability} /><p className="mt-3 text-xs text-text-muted">Event and snapshot unverified</p></Surface>;
}
