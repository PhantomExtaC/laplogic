import type { MomentumData } from '../domain/types/core';
import { Sparkline } from '../charts/Sparkline';
import { InfoPopover } from './InfoPopover';
import { ScrollRegion } from './ScrollRegion';
import { Num } from './Indicators';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export function MomentumTicker({ data }: { data: Omit<MomentumData, 'drivers'> & { drivers: (MomentumData['drivers'][number] & { name: string })[] } }) {
  return <div className="space-y-4"><InfoPopover label="Momentum definition & direction">{data.definition}</InfoPopover>
    <ScrollRegion label="Driver momentum over five recorded races"><div className="flex gap-4 pb-2">
      {data.drivers.map(driver => {
        const points = [...driver.points].sort((a, b) => a.round - b.round);
        const latest = points.at(-1);
        const Icon = latest?.direction === 'up' ? ArrowUpRight : latest?.direction === 'down' ? ArrowDownRight : Minus;
        return <article key={driver.driverId} className="w-52 shrink-0 rounded-lg border border-line bg-obsidian/40 p-4">
          <h3 className="min-h-11 text-sm font-semibold">{driver.name}</h3>
          <div className="flex items-end justify-between gap-3"><Num value={latest?.momentum} digits={1} className="text-xl" /><span className="flex items-center gap-1 text-xs text-text-muted"><Icon size={15} aria-hidden="true" /><Num value={latest?.delta} digits={1} /><span>{latest?.direction ?? 'unknown'}</span></span></div>
          <Sparkline summary={latest ? `As of round ${latest.round}; change in index points` : 'No race window available'} values={points.map(point => ({ label: `Round ${point.round}`, value: point.momentum }))} />
        </article>;
      })}
    </div></ScrollRegion>
  </div>;
}
