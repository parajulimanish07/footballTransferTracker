import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TransferDirection } from '@/types/news';

export function TransferDirectionBadge({ direction, className }: { direction: TransferDirection; className?: string }) {
  const meta = {
    incoming: { label: 'Incoming Target', icon: ArrowDownLeft, tone: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
    outgoing: { label: 'Outgoing Departure', icon: ArrowUpRight, tone: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
    related: { label: 'Club Related', icon: ArrowRightLeft, tone: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
    null: { label: 'Club Related', icon: ArrowRightLeft, tone: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  }[direction ?? 'null'];

  const Icon = meta.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide', meta.tone, className)}>
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}