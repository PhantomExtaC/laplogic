import type { ReactNode } from 'react';
export function InfoPopover({ label, children }: { label: string; children: ReactNode }) {
  return <details className="rounded-lg border border-line px-3"><summary className="min-h-11 content-center text-sm text-text-muted">{label}</summary><div className="max-w-prose pb-4 text-sm text-text-muted">{children}</div></details>;
}
export const Tooltip = InfoPopover;
