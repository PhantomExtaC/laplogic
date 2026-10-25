import type { ReactNode } from 'react';
import clsx from 'clsx';

export function SectionHeader({ title, kicker, asOf, actions, level = 2 }: {
  title: string; kicker?: string; asOf?: string; actions?: ReactNode; level?: 1 | 2 | 3;
}) {
  const Heading = level === 1 ? 'h1' : level === 3 ? 'h3' : 'h2';
  return <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
    <div className="min-w-0">
      {kicker && <p className="kicker mb-2">{kicker}</p>}
      <Heading className={clsx('font-semibold text-text', level === 1 ? 'text-[28px] sm:text-[40px]' : 'text-xl tracking-tight')}>{title}</Heading>
      {asOf && <p className="mt-1 text-xs text-text-muted">{asOf}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </header>;
}
export function Surface({ children, title, kicker, asOf, actions, variant = 'default', className }: {
  children: ReactNode; title?: string; kicker?: string; asOf?: string; actions?: ReactNode;
  variant?: 'default' | 'raised' | 'accent'; className?: string;
}) {
  return <section className={clsx('min-w-0 rounded-xl border border-line p-5 shadow-surface sm:p-6', variant === 'raised' ? 'bg-charcoal-2' : 'bg-charcoal', variant === 'accent' && 'border-t-2 border-t-telemetry-red', className)}>
    {title && <SectionHeader title={title} kicker={kicker} asOf={asOf} actions={actions} />}
    {children}
  </section>;
}
