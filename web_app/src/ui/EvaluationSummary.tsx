import { Badge, Num } from './Indicators';
import { StaleBanner } from './States';

export function EvaluationSummary({ evaluation }: { evaluation: { championId: string | null; conflict: boolean; sampleCount: number | null; models: { id: string; accuracy: number | null }[] } }) {
  return <div className="space-y-4">{evaluation.conflict && <StaleBanner>Conflicting evaluation runs. Champion selection is withheld until the engine owner reconciles the runs.</StaleBanner>}
    <div className="flex flex-wrap items-center justify-between gap-3"><Badge>Champion {evaluation.championId ?? 'unresolved'}</Badge><span className="text-xs text-text-muted">Evaluation cohort: <Num value={evaluation.sampleCount} /></span></div>
    {evaluation.models.map(model => <div key={model.id} className="flex justify-between gap-3 border-t border-line pt-3"><span className="text-sm">{model.id}</span><Num value={model.accuracy === null ? null : model.accuracy * 100} digits={1} unit="%" /></div>)}
    <p className="text-xs text-text-muted">Top-3 definitions, eligibility and evaluation windows travel with the evaluation contract.</p>
  </div>;
}
