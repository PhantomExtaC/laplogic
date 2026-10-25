import type { ReactNode } from 'react';
import clsx from 'clsx';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'alert' }) {
  return <span className={clsx('inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] font-medium uppercase tracking-wide', {
    'border-line bg-obsidian/30 text-text-muted': tone === 'neutral',
    'border-sector-green/25 bg-sector-green/10 text-sector-green': tone === 'success',
    'border-drs-amber/25 bg-drs-amber/10 text-drs-amber': tone === 'warning',
    'border-telemetry-red/25 bg-telemetry-red/10 text-red-400': tone === 'alert',
  })}>{children}</span>;
}
export const StatusChip = Badge;
export function SampleDataChip() { return <Badge tone="warning">SAMPLE DATA</Badge>; }
export function Num({ value, digits = 0, unit, className }: { value: number | null | undefined; digits?: number; unit?: string; className?: string }) {
  return <span className={clsx('inline-block text-right font-mono tabular-nums', className)}>{value == null || !Number.isFinite(value) ? <span aria-label="Unavailable">—</span> : <>{value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}{unit && <span className="ml-1 text-xs text-text-muted">{unit}</span>}</>}</span>;
}
export function Delta({ before, after, higherIsBetter = true }: { before: number | null; after: number | null; higherIsBetter?: boolean }) {
  if (before === null || after === null) return <Num value={null} />;
  const delta = (after - before) * 100;
  const positive = higherIsBetter ? delta > 0 : delta < 0;
  const Icon = delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;
  return <span className={clsx('inline-flex items-center gap-1 font-mono text-sm', delta === 0 ? 'text-text-muted' : positive ? 'text-sector-green' : 'text-red-400')}><Icon size={16} aria-hidden="true" />{delta >= 0 ? '+' : ''}{delta.toFixed(1)} pp<span className="sr-only">{delta === 0 ? 'unchanged' : positive ? 'improvement' : 'decline'}</span></span>;
}
export function ProgressBar({ value, label }: { value: number; label: string }) {
  return <div role="progressbar" aria-label={label} aria-valuenow={value * 100} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-charcoal-2"><div className="h-full rounded-full bg-telemetry-red" style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} /></div>;
}
export function Stat({ label, value, unit, scope, help }: { label: string; value: number | null; unit?: string; scope: string; help?: string }) {
  return <div className="min-w-0"><p className="kicker">{label}</p><p className="my-2 text-[28px] font-semibold"><Num value={value} unit={unit} /></p><p className="text-xs text-text-muted">{scope}</p>{help && <p className="mt-2 text-xs text-text-muted">{help}</p>}</div>;
}
