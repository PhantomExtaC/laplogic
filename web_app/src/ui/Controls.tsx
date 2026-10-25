import { useId } from 'react';
import type { ReactNode, SelectHTMLAttributes } from 'react';

export function Select({ label, children, id, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const generated = useId();
  return <label className="flex min-w-0 flex-col gap-2 text-xs text-text-muted" htmlFor={id ?? generated}>{label}<select {...props} id={id ?? generated} className="control w-full text-sm">{children}</select></label>;
}
export function SearchInput({ label = 'Search', value, onChange, placeholder }: { label?: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  const id = useId();
  return <label htmlFor={id} className="flex flex-col gap-2 text-xs text-text-muted">{label}<input id={id} type="search" className="control w-full text-sm" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></label>;
}
export function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  const id = useId();
  const update = (next: number) => { if (Number.isFinite(next)) onChange(Math.max(min, Math.min(max, Math.round(next)))); };
  return <fieldset className="space-y-3"><legend className="text-sm">{label}</legend><div className="flex items-center gap-4"><label className="sr-only" htmlFor={id}>{label} slider</label><input id={id} type="range" className="min-h-11 min-w-0 flex-1 accent-telemetry-red" min={min} max={max} step={1} value={value} onChange={e => update(e.target.valueAsNumber)} /><label className="sr-only" htmlFor={`${id}-number`}>{label} numeric value</label><input id={`${id}-number`} type="number" className="control w-20 font-mono" min={min} max={max} step={1} value={value} onChange={e => update(e.target.valueAsNumber)} /></div></fieldset>;
}
export function Tabs({ label, tabs, value, onChange }: { label: string; tabs: { id: string; label: string; content: ReactNode }[]; value: string; onChange: (value: string) => void }) {
  const id = useId();
  return <div><div role="tablist" aria-label={label} className="mb-5 flex flex-wrap gap-2">{tabs.map((tab, index) => <button key={tab.id} id={`${id}-${tab.id}`} role="tab" aria-selected={value === tab.id} aria-controls={`${id}-panel-${tab.id}`} tabIndex={value === tab.id ? 0 : -1} className={`button ${value === tab.id ? 'border-telemetry-red text-text' : 'text-text-muted'}`} onClick={() => onChange(tab.id)} onKeyDown={e => {
    const next = e.key === 'ArrowRight' ? (index + 1) % tabs.length : e.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
    if (next !== null) { e.preventDefault(); onChange(tabs[next].id); document.getElementById(`${id}-${tabs[next].id}`)?.focus(); }
  }}>{tab.label}</button>)}</div>{tabs.map(tab => <div key={tab.id} id={`${id}-panel-${tab.id}`} role="tabpanel" aria-labelledby={`${id}-${tab.id}`} hidden={value !== tab.id} tabIndex={0}>{tab.content}</div>)}</div>;
}
