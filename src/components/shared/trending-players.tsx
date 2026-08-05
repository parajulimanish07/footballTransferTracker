'use client';

import { Flame, User } from 'lucide-react';
import { TransferStatusBadge } from '@/components/transfer/transfer-status-badge';
import type { TransferStatus } from '@/types/news';

export function TrendingPlayers({ players }: { players: Array<{ id: string; name: string; club: string; status: string }> }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 text-slate-100">
      <div className="flex items-center gap-2 font-display text-sm sm:text-base font-bold text-white">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Flame className="h-3.5 w-3.5" />
        </span>
        <span>Trending Targets</span>
      </div>

      <div className="mt-3.5 space-y-2.5">
        {players.length ? (
          players.map((player) => (
            <div
              key={player.id}
              className="group rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 transition-colors hover:border-slate-700 hover:bg-slate-950"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs sm:text-sm text-white leading-tight truncate group-hover:text-cyan-300 transition-colors">
                    {player.name}
                  </h4>
                  <p className="mt-0.5 text-[11px] text-slate-400 truncate">
                    {player.club}
                  </p>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                <span className="text-slate-400 font-medium">Status</span>
                <TransferStatusBadge status={player.status as TransferStatus} className="text-[10px] px-2 py-0.5" />
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">No active trending players found for this selection.</p>
        )}
      </div>
    </div>
  );
}