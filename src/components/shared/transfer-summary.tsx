import { ArrowDownLeft, ArrowUpRight, Target } from 'lucide-react';

export function TransferSummary({ arrivals, departures, targets }: { arrivals: number; departures: number; targets: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Stat label="Confirmed Arrivals" value={arrivals} icon={ArrowDownLeft} accent="emerald" />
      <Stat label="Confirmed Departures" value={departures} icon={ArrowUpRight} accent="rose" />
      <Stat label="Active Targets" value={targets} icon={Target} accent="cyan" />
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: 'emerald' | 'rose' | 'cyan';
}) {
  const accentStyles = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
    cyan: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
  }[accent];

  return (
    <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</span>
        <div className="mt-1 font-display text-2xl font-extrabold text-text">{value}</div>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${accentStyles}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}