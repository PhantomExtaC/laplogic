import type { ReactNode } from 'react';
export function ScrollRegion({ children, label, minWidth }: { children: ReactNode; label: string; minWidth?: string }) {
  return <div className="min-w-0"><p className="mb-2 text-[11px] text-text-muted">Scroll horizontally to view more columns when needed.</p><div role="region" aria-label={label} tabIndex={0} className="scroll-region max-w-full overflow-x-auto rounded-lg pb-2"><div className={minWidth}>{children}</div></div></div>;
}
