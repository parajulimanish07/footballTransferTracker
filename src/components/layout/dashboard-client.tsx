'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Search, RefreshCw, X, ShieldCheck, Plus, Globe } from 'lucide-react';
import { clubs } from '@/config/clubs';
import { useFeedPreference } from '@/hooks/use-feed-preference';
import { TransferFilters } from '@/components/filters/transfer-filters';
import { NewsFeed } from '@/components/news/news-feed';
import { NewsCardSkeleton } from '@/components/news/news-card-skeleton';
import { TrendingPlayers } from '@/components/shared/trending-players';
import { LastUpdatedIndicator } from '@/components/shared/last-updated-indicator';
import { TransferSummary } from '@/components/shared/transfer-summary';
import { ClubLogo } from '@/components/clubs/club-logo';
import type { NewsApiResponse, TransferNewsItem, FeedMode } from '@/types/news';

// In-Memory Client Feed Cache for Instant Tab/Club Switching (<50ms)
const clientFeedCache = new Map<string, NewsApiResponse>();

// Lazy-load secondary AI RAG assistant widget
const RAGAssistantWidget = dynamic(
  () => import('@/components/ai/rag-assistant-widget').then((mod) => mod.RAGAssistantWidget),
  { ssr: false }
);

export function DashboardClient() {
  const { settings } = useFeedPreference();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawSearch = searchParams.get('search') ?? '';
  const rawClub = searchParams.get('club');
  const rawMode = searchParams.get('mode');

  // Determine feed mode safely without forcing a default club
  const mode: FeedMode = rawMode === 'global' ? 'global' : rawClub ? 'club' : settings.defaultMode;
  const selectedClubId: string | null = mode === 'club' ? rawClub || settings.defaultClubId || settings.followedClubIds[0] || null : null;

  const [searchValue, setSearchValue] = useState(rawSearch);
  const [data, setData] = useState<NewsApiResponse | null>(() => {
    const initialKey = `${mode}:${selectedClubId || 'all'}:${rawSearch}`;
    return clientFeedCache.get(initialKey) || null;
  });
  const [loading, setLoading] = useState(() => !data);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const userFollowedClubs = useMemo(() => {
    if (settings.followedClubIds.length) {
      const ids = new Set(settings.followedClubIds);
      return clubs.filter((c) => ids.has(c.id));
    }
    return clubs.slice(0, 6);
  }, [settings.followedClubIds]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (mode === 'club' && selectedClubId) {
      params.set('club', selectedClubId);
    }
    for (const key of ['reliability', 'status', 'direction', 'source', 'journalist', 'from', 'to', 'page', 'limit', 'sort', 'search', 'league'] as const) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }
    return params.toString();
  }, [mode, selectedClubId, searchParams]);

  useEffect(() => {
    let active = true;

    // Check client-side memory cache for instant rendering
    const cached = clientFeedCache.get(queryString);
    if (cached) {
      setData(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    fetch(`/api/news?${queryString}`)
      .then((response) => response.json())
      .then((json: NewsApiResponse) => {
        if (!active) return;
        clientFeedCache.set(queryString, json);
        setData(json);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        if (!clientFeedCache.has(queryString)) {
          setError('Could not load verified transfer news.');
        }
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [queryString]);

  const currentClub = selectedClubId ? clubs.find((item) => item.id === selectedClubId) ?? null : null;
  const items: TransferNewsItem[] = data?.data ?? [];

  const transferItems = useMemo(
    () => items.filter((item) => item.transferStatus !== 'not_transfer_news'),
    [items]
  );

  // Global Statistics Cards
  const officialDeals = useMemo(
    () => new Set(transferItems.filter((i) => i.transferStatus === 'official' && i.playerName).map((i) => i.playerName!.toLowerCase())).size,
    [transferItems]
  );

  const advancedTransfers = useMemo(
    () =>
      new Set(
        transferItems
          .filter((i) => (i.transferStatus === 'agreement_reached' || i.transferStatus === 'advanced_talks') && i.playerName)
          .map((i) => i.playerName!.toLowerCase())
      ).size,
    [transferItems]
  );

  const activeRumours = useMemo(
    () =>
      new Set(
        transferItems
          .filter(
            (i) =>
              (i.transferStatus === 'negotiations' ||
                i.transferStatus === 'bid_submitted' ||
                i.transferStatus === 'approach_made' ||
                i.transferStatus === 'interest') &&
              i.playerName
          )
          .map((i) => i.playerName!.toLowerCase())
      ).size,
    [transferItems]
  );

  const reportsToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return transferItems.filter((i) => i.publishedAt.startsWith(today)).length;
  }, [transferItems]);

  // Club Mode Statistics Cards
  const uniqueArrivals = useMemo(
    () =>
      new Set(
        transferItems
          .filter((i) => i.transferStatus === 'official' && i.destinationClub?.id === selectedClubId && i.playerName)
          .map((i) => i.playerName!.toLowerCase())
      ).size,
    [transferItems, selectedClubId]
  );

  const uniqueDepartures = useMemo(
    () =>
      new Set(
        transferItems
          .filter((i) => i.transferStatus === 'official' && i.currentClub?.id === selectedClubId && i.playerName)
          .map((i) => i.playerName!.toLowerCase())
      ).size,
    [transferItems, selectedClubId]
  );

  const uniqueTargets = useMemo(
    () =>
      new Set(
        transferItems
          .filter((i) => i.transferStatus !== 'official' && i.destinationClub?.id === selectedClubId && i.playerName)
          .map((i) => i.playerName!.toLowerCase())
      ).size,
    [transferItems, selectedClubId]
  );

  // Trending Targets Panel
  const trendingPlayers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; club: string; status: string }>();

    transferItems
      .filter((item) => item.playerName && (mode === 'global' ? item.destinationClub : item.destinationClub?.id === selectedClubId))
      .forEach((item) => {
        const key = item.playerName!.toLowerCase();
        if (!map.has(key)) {
          const clubLabel = item.destinationClub
            ? `Linked with ${item.destinationClub.name}`
            : item.currentClub
            ? `From ${item.currentClub.name}`
            : 'Target Reported';
          map.set(key, {
            id: item.id,
            name: item.playerName!,
            club: clubLabel,
            status: item.transferStatus,
          });
        }
      });

    return Array.from(map.values()).slice(0, 5);
  }, [transferItems, mode, selectedClubId]);

  const switchToGlobal = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.set('mode', 'global');
    next.delete('club');
    router.replace(`/dashboard?${next.toString()}`);
  }, [router, searchParams]);

  const switchToClub = useCallback((id: string) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set('mode', 'club');
    next.set('club', id);
    router.replace(`/dashboard?${next.toString()}`);
  }, [router, searchParams]);

  // Debounced search handler (300ms)
  const handleSearchChange = (term: string) => {
    setSearchValue(term);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (term.trim()) {
        next.set('search', term.trim());
      } else {
        next.delete('search');
      }
      router.replace(`/dashboard?${next.toString()}`);
    }, 300);
  };

  const [refreshing, setRefreshing] = useState(false);

  const handleSyncFeed = async () => {
    clientFeedCache.clear();
    setRefreshing(true);
    setLoading(true);
    try {
      const res = await fetch(`/api/news?${queryString}&refresh=true&t=${Date.now()}`);
      const json: NewsApiResponse = await res.json();
      clientFeedCache.set(queryString, json);
      setData(json);
      setError(null);
    } catch {
      setError('Could not sync latest transfer news.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 lg:px-8 space-y-5">
      {/* Club Switcher Tab Bar */}
      <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-2 sm:px-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-1 shrink-0 hidden sm:inline">
            Feed:
          </span>

          {/* All Transfer News Tab */}
          <button
            type="button"
            onClick={switchToGlobal}
            className={`flex items-center gap-2 shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
              mode === 'global'
                ? 'bg-emerald-500 text-slate-950 font-extrabold'
                : 'border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-text hover:bg-slate-800'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>All Transfer News</span>
          </button>

          {/* Followed Club Tabs */}
          {userFollowedClubs.map((club) => {
            const isActive = mode === 'club' && club.id === selectedClubId;
            return (
              <button
                key={club.id}
                type="button"
                onClick={() => switchToClub(club.id)}
                className={`flex items-center gap-2 shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-extrabold'
                    : 'border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-text hover:bg-slate-800'
                }`}
              >
                <ClubLogo clubId={club.id} size="xs" />
                <span>{club.name}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => router.push('/onboarding')}
          className="flex items-center gap-1.5 shrink-0 rounded-lg border border-dashed border-slate-700 bg-slate-800/40 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-text hover:border-slate-500 transition-colors ml-2"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Manage Clubs</span>
        </button>
      </div>

      {/* Main Grid: Feed Content (Left) & Sidebar Widgets (Right) */}
      <div className="flex flex-col gap-5 lg:flex-row">
        <main className="min-w-0 flex-1 space-y-5">
          {/* Minimal Transfer Command Banner */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
                  {currentClub ? (
                    <ClubLogo clubId={currentClub.id} size="xs" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  <span>{mode === 'global' ? 'All Clubs' : currentClub?.league || 'Premier League'}</span>
                </div>
                <h1 className="mt-2 font-display text-2xl font-extrabold text-text sm:text-3xl">
                  {mode === 'global' ? 'Football Transfer Intelligence' : `${currentClub?.name || 'Club'} Transfer Hub`}
                </h1>
                <p className="mt-1.5 max-w-xl text-xs sm:text-sm text-slate-300">
                  {mode === 'global'
                    ? 'Verified transfer reports from trusted journalists, official clubs, and reliable publishers across all major leagues.'
                    : `Verified transfer reports and Tier-1 updates for ${currentClub?.name || 'your club'}. Direct from official club outlets and verified journalists.`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <LastUpdatedIndicator updatedAt={data?.meta.lastUpdated ?? new Date().toISOString()} />
                <button
                  type="button"
                  disabled={refreshing}
                  onClick={handleSyncFeed}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-text hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Syncing...' : 'Sync Feed'}</span>
                </button>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="mt-5 flex flex-col gap-3 pt-4 border-t border-slate-800 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search player, target club, or journalist..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-10 pr-9 py-2 text-xs text-text placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-text"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <TransferFilters />
            </div>
          </section>

          {/* Verified Transfer Summary Statistics */}
          <TransferSummary
            mode={mode}
            officialDeals={officialDeals}
            advancedTransfers={advancedTransfers}
            activeRumours={activeRumours}
            reportsToday={reportsToday}
            arrivals={uniqueArrivals}
            departures={uniqueDepartures}
            targets={uniqueTargets}
          />

          {/* News Feed Stream */}
          {error ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 text-xs text-rose-200">
              {error}
            </div>
          ) : null}

          {loading && !items.length ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-xs text-slate-400">
              Loading verified transfer reports across supported clubs...
            </div>
          ) : !items.length ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-xs text-slate-400">
              No verified transfer reports are available right now. Try refreshing the feed or adjusting your filters.
            </div>
          ) : (
            <NewsFeed items={items} selectedClubId={selectedClubId} />
          )}
        </main>

        {/* Sidebar: RAG Transfer Assistant & Verified Trending Targets */}
        <aside className="w-full lg:w-[320px] shrink-0 space-y-5">
          <RAGAssistantWidget articles={items} />
          <TrendingPlayers players={trendingPlayers} />
        </aside>
      </div>
    </div>
  );
}