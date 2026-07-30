'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, RefreshCw, X, ShieldCheck, Plus, Sparkles } from 'lucide-react';
import { clubs } from '@/config/clubs';
import { useFollowedClubs } from '@/hooks/use-followed-clubs';
import { TransferFilters } from '@/components/filters/transfer-filters';
import { NewsFeed } from '@/components/news/news-feed';
import { NewsCardSkeleton } from '@/components/news/news-card-skeleton';
import { TrendingPlayers } from '@/components/shared/trending-players';
import { LastUpdatedIndicator } from '@/components/shared/last-updated-indicator';
import { TransferSummary } from '@/components/shared/transfer-summary';
import { RAGAssistantWidget } from '@/components/ai/rag-assistant-widget';
import type { NewsApiResponse, TransferNewsItem } from '@/types/news';

export function DashboardClient() {
  const { followedClubs, hydrated } = useFollowedClubs();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<NewsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '');

  const clubQuery = searchParams.get('club') ?? followedClubs[0] ?? 'liverpool';

  const userSelectedClubs = useMemo(() => {
    const ids = new Set([...(followedClubs.length ? followedClubs : ['liverpool', 'arsenal', 'real-madrid', 'barcelona'])]);
    return clubs.filter((c) => ids.has(c.id));
  }, [followedClubs]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('club', clubQuery);
    for (const key of ['reliability', 'status', 'direction', 'source', 'journalist', 'from', 'to', 'page', 'limit', 'sort', 'search'] as const) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }
    return params.toString();
  }, [clubQuery, searchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/news?${queryString}`)
      .then((response) => response.json())
      .then((json: NewsApiResponse) => {
        if (!active) return;
        setData(json);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError('Could not load verified transfer news.');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [queryString]);

  const currentClub = clubs.find((item) => item.id === clubQuery) ?? clubs[0];
  const items: TransferNewsItem[] = data?.data ?? [];

  function switchClub(id: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set('club', id);
    router.replace(`/dashboard?${next.toString()}`);
  }

  function handleSearch(term: string) {
    setSearchValue(term);
    const next = new URLSearchParams(searchParams.toString());
    if (term.trim()) {
      next.set('search', term.trim());
    } else {
      next.delete('search');
    }
    router.replace(`/dashboard?${next.toString()}`);
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6 pb-28 sm:px-6 lg:px-8">
      <main className="min-w-0 flex-1 space-y-6">
        {/* Interactive Club Switcher Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider pr-1 shrink-0 hidden sm:inline">
            Clubs:
          </span>
          {userSelectedClubs.map((club) => {
            const isActive = club.id === clubQuery;
            return (
              <button
                key={club.id}
                type="button"
                onClick={() => switchClub(club.id)}
                className={`flex items-center gap-2 shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-accent-emerald text-slate-950 shadow-emeraldGlow'
                    : 'border border-white/10 bg-panel/60 text-muted hover:text-text hover:bg-white/10'
                }`}
              >
                <span>{club.name}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => router.push('/onboarding')}
            className="flex items-center gap-1 shrink-0 rounded-xl border border-dashed border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-muted hover:text-text hover:border-white/40 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Manage</span>
          </button>
        </div>

        {/* Club Transfer Command Banner */}
        <section className="glass-panel relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-cyan">
                <ShieldCheck className="h-4 w-4" />
                <span>{currentClub.league}</span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
                {currentClub.name} <span className="text-accent-emerald">Transfer Hub</span>
              </h1>
              <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-300">
                Verified transfer reports and Tier-1 updates for {currentClub.name}. Direct from official outlets and verified journalists.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <LastUpdatedIndicator updatedAt={data?.meta.lastUpdated ?? new Date().toISOString()} />
              <button
                type="button"
                onClick={() => router.refresh()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-text hover:bg-white/10 transition-all active:scale-95"
              >
                <RefreshCw className="h-3.5 w-3.5 text-accent-emerald" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="mt-6 flex flex-col gap-3 pt-5 border-t border-white/10 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search player, club, or journalist..."
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 pl-10 pr-9 py-2 text-xs text-text placeholder:text-muted focus:border-accent-emerald focus:outline-none focus:ring-1 focus:ring-accent-emerald transition-all"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <TransferFilters />
          </div>
        </section>

        {/* Transfer Summary Statistics */}
        <TransferSummary arrivals={1} departures={1} targets={3} />

        {/* News Feed Stream */}
        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {loading && !items.length ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <NewsCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <NewsFeed items={items} />
        )}
      </main>

      {/* Sidebar: Trending Players & RAG Transfer Assistant */}
      <aside className="hidden w-[340px] shrink-0 space-y-5 lg:block">
        <RAGAssistantWidget articles={items} />
        <TrendingPlayers
          players={(data?.data ?? []).slice(0, 5).map((item) => ({
            id: item.id,
            name: item.playerName ?? 'Transfer Target',
            club: item.destinationClub?.name ?? item.currentClub?.name ?? 'Europe',
            status: item.transferStatus,
          }))}
        />
      </aside>
    </div>
  );
}