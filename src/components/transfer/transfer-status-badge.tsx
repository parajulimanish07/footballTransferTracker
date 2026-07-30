import { cn } from '@/lib/utils';
import type { TransferStatus } from '@/types/news';
import { formatTransferStatus } from '@/lib/news/classify-transfer-status';

export function TransferStatusBadge({ status, className }: { status: TransferStatus; className?: string }) {
  const tone = {
    official: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    agreement_reached: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    advanced_talks: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    negotiations: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    bid_submitted: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    approach_made: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    interest: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    departure_expected: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  }[status];

  const dotColor = {
    official: 'bg-emerald-400',
    agreement_reached: 'bg-emerald-400',
    advanced_talks: 'bg-cyan-400 animate-status-pulse',
    negotiations: 'bg-sky-400 animate-status-pulse',
    bid_submitted: 'bg-amber-400 animate-status-pulse',
    approach_made: 'bg-amber-400',
    interest: 'bg-slate-400',
    departure_expected: 'bg-rose-400',
  }[status];

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide', tone, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} />
      {formatTransferStatus(status)}
    </span>
  );
}