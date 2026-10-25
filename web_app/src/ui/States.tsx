import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, RotateCcw } from 'lucide-react';

export function Skeleton({ label = 'Loading data…' }: { label?: string }) {
  return <div role="status" className="space-y-3 py-4"><span className="sr-only">{label}</span><div className="h-4 w-1/3 animate-pulse rounded bg-charcoal-2" /><div className="h-12 animate-pulse rounded bg-charcoal-2" /><div className="h-4 w-2/3 animate-pulse rounded bg-charcoal-2" /></div>;
}
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="flex flex-col items-start gap-3 py-8"><Inbox className="text-text-muted" size={24} aria-hidden="true" /><h2 className="text-xl font-semibold">{title}</h2><p className="max-w-xl text-text-muted">{description}</p>{action && <div className="mt-2">{action}</div>}</div>;
}
export function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return <div role="alert" className="space-y-3 rounded-lg border border-telemetry-red/25 bg-telemetry-red/5 p-4"><p className="flex items-start gap-2"><AlertTriangle size={20} className="shrink-0 text-red-400" aria-hidden="true" /><span>Data unavailable</span></p><p className="break-words text-sm text-text-muted">{message}</p><button className="button" onClick={retry}><RotateCcw size={16} aria-hidden="true" />Retry</button></div>;
}
export function StaleBanner({ children = 'Snapshot or freshness unavailable. Treat these values as an unverified export.' }: { children?: ReactNode }) {
  return <div role="status" className="mb-4 flex items-start gap-2 rounded-lg border border-drs-amber/20 bg-drs-amber/5 p-3 text-xs text-drs-amber"><AlertTriangle size={16} className="shrink-0" aria-hidden="true" /><p><strong className="font-mono">STALE / UNVERIFIED</strong><span className="mx-2">·</span>{children}</p></div>;
}
