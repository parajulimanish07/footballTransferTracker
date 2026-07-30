import { ShieldCheck, CheckCircle2, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReliabilityLevel } from '@/types/source';

const labels: Record<ReliabilityLevel, string> = {
  official: 'Official Club',
  tier_1: 'Tier 1 Journalist',
  tier_2: 'Tier 2 Outlet',
  trusted: 'Trusted Outlet',
};

export function ReliabilityBadge({ level, className }: { level: ReliabilityLevel; className?: string }) {
  const tone = {
    official: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35 shadow-sm',
    tier_1: 'bg-sky-500/20 text-sky-300 border-sky-500/35 shadow-sm',
    tier_2: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/35 shadow-sm',
    trusted: 'bg-amber-500/20 text-amber-300 border-amber-500/35 shadow-sm',
  }[level];

  const Icon = level === 'official' ? CheckCircle2 : level === 'tier_1' ? Award : ShieldCheck;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide', tone, className)}>
      <Icon className="h-3.5 w-3.5" />
      {labels[level]}
    </span>
  );
}