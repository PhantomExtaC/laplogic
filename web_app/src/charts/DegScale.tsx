import { Num } from '../ui/Indicators';
export function DegScale({ value, summary }: { value: number | null; summary: string }) {
  return <figure><figcaption className="mb-2 text-sm text-text-muted">{summary}</figcaption><div className="flex gap-1" aria-hidden="true">{[1, 2, 3, 4, 5].map(level => <span key={level} className={`h-3 flex-1 rounded-sm ${value !== null && level <= value ? 'bg-drs-amber' : 'bg-charcoal-2'}`} />)}</div><table className="mt-2 w-full text-xs"><caption className="sr-only">Degradation scale</caption><tbody><tr><th scope="row" className="text-left font-normal text-text-muted">Degradation index (1–5)</th><td className="text-right"><Num value={value} /></td></tr></tbody></table></figure>;
}
export const TireDegBar = DegScale;
