import { Flame, User } from 'lucide-react';
import { TransferStatusBadge } from '@/components/transfer/transfer-status-badge';
import type { TransferStatus } from '@/types/news';

export function TrendingPlayers({ players }: { players: Array<{ id: string; name: string; club: string; status: string }> }) {
  return (
    <div className="glass-card rounded-3xl p-5 sticky top-20">
      <div className="flex items-center gap-2 font-display text-base font-bold text-text">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-accent-amber border border-amber-500/20">
          <Flame className="h-4 w-4" />
        </span>
        <span>Trending Targets</span>
      </div>

      <div className="mt-4 space-y-2.5">
        {players.length ? (
          players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-muted border border-white/10 font-bold text-xs">
                  <User className="h-4 w-4 text-accent-cyan" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-text truncate">{player.name}</p>
                  <p className="text-xs text-muted truncate">{player.club}</p>
                </div>
              </div>

              <div className="shrink-0">
                <TransferStatusBadge status={player.status as TransferStatus} className="text-[10px] px-2 py-0" />
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted py-4 text-center">No active trending players found for this selection.</p>
        )}
      </div>
    </div>
  );
}