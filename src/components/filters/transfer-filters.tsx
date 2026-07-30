'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Sparkles, SlidersHorizontal, X } from 'lucide-react';

export function TransferFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);

  const activeReliability = searchParams.get('reliability');
  const activeStatus = searchParams.get('status');
  const activeSort = searchParams.get('sort');

  function toggleParam(name: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (searchParams.get(name) === value) {
      next.delete(name);
    } else {
      next.set(name, value);
    }
    router.replace(`/dashboard?${next.toString()}`);
  }

  function clearAll() {
    const next = new URLSearchParams();
    const club = searchParams.get('club');
    if (club) next.set('club', club);
    router.replace(`/dashboard?${next.toString()}`);
  }

  const hasActiveFilters = activeReliability || activeStatus || activeSort;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="hidden sm:flex items-center gap-1 text-xs text-muted pr-1">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span>Filters:</span>
      </div>

      <button
        type="button"
        onClick={() => toggleParam('sort', 'most_reliable')}
        className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
          activeSort === 'most_reliable'
            ? 'bg-accent-emerald text-slate-950 shadow-emeraldGlow'
            : 'border border-white/10 bg-white/5 text-muted hover:text-text hover:bg-white/10'
        }`}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Top Reliable First
      </button>

      <button
        type="button"
        onClick={() => toggleParam('reliability', 'official')}
        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
          activeReliability === 'official'
            ? 'bg-emerald-500 text-slate-950 shadow-sm'
            : 'border border-white/10 bg-white/5 text-muted hover:text-text hover:bg-white/10'
        }`}
      >
        Official Only
      </button>

      <button
        type="button"
        onClick={() => toggleParam('reliability', 'tier_1')}
        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
          activeReliability === 'tier_1'
            ? 'bg-sky-500 text-slate-950 shadow-sm'
            : 'border border-white/10 bg-white/5 text-muted hover:text-text hover:bg-white/10'
        }`}
      >
        Tier 1 Journalists
      </button>

      <button
        type="button"
        onClick={() => toggleParam('status', 'advanced_talks')}
        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
          activeStatus === 'advanced_talks'
            ? 'bg-cyan-500 text-slate-950 shadow-sm'
            : 'border border-white/10 bg-white/5 text-muted hover:text-text hover:bg-white/10'
        }`}
      >
        Advanced Talks
      </button>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1 rounded-xl border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-all"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}