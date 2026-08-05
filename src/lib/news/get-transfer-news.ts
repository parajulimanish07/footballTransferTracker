import { multiProvider } from './providers/multi-provider';
import type { FilterState, NewsApiResponse, TransferNewsItem, FeedMode } from '@/types/news';
import { getLeagueBySlug } from '@/config/leagues';

export interface TransferNewsQuery extends FilterState {
  mode?: FeedMode;
  selectedClubId?: string | null;
  clubIds?: string[];
  leagueIds?: string[];
  league?: string | null;
  forceRefresh?: boolean;
}

const STATUS_RANK: Record<string, number> = {
  official: 1,
  agreement_reached: 2,
  advanced_talks: 3,
  bid_submitted: 4,
  negotiations: 5,
  approach_made: 6,
  interest: 7,
  departure_expected: 8,
};

export async function getTransferNews(query: TransferNewsQuery = {}): Promise<NewsApiResponse> {
  const isGlobalMode = query.mode === 'global' || (!query.selectedClubId && !query.clubIds?.length && !query.league && query.mode !== 'club');
  const effectiveQuery: TransferNewsQuery = {
    ...query,
    mode: isGlobalMode ? 'global' : 'club',
    clubIds: isGlobalMode ? [] : query.clubIds || (query.selectedClubId ? [query.selectedClubId] : []),
  };

  const result = await multiProvider.getTransferNewsWithHealth(effectiveQuery);
  let items = result.data;

  // Always exclude non-transfer news from live feeds
  items = items.filter((item) => item.transferStatus !== 'not_transfer_news');

  // Filter by league if requested
  if (query.league || (query.leagueIds && query.leagueIds.length > 0)) {
    const targetLeagueSlug = query.league || query.leagueIds?.[0];
    const leagueObj = targetLeagueSlug ? getLeagueBySlug(targetLeagueSlug) : null;
    const leagueName = leagueObj?.name.toLowerCase() || targetLeagueSlug?.toLowerCase();

    if (leagueObj) {
      const allowedClubSet = new Set(leagueObj.clubIds);
      items = items.filter(
        (item) =>
          (item.currentClub?.id && allowedClubSet.has(item.currentClub.id)) ||
          (item.destinationClub?.id && allowedClubSet.has(item.destinationClub.id)) ||
          item.relatedClubIds.some((id) => allowedClubSet.has(id))
      );
    } else if (leagueName) {
      items = items.filter(
        (item) =>
          item.currentClub?.league.toLowerCase().includes(leagueName) ||
          item.destinationClub?.league.toLowerCase().includes(leagueName)
      );
    }
  }

  if (isGlobalMode) {
    if (query.club) {
      items = items.filter(
        (item) =>
          item.currentClub?.id === query.club ||
          item.destinationClub?.id === query.club ||
          item.relatedClubIds.includes(query.club!)
      );
    }

    // Rank global items by status importance, reliability, and recency
    items.sort((a, b) => {
      const rankA = STATUS_RANK[a.transferStatus] || 99;
      const rankB = STATUS_RANK[b.transferStatus] || 99;
      if (rankA !== rankB) return rankA - rankB;

      if (a.isOfficial && !b.isOfficial) return -1;
      if (!a.isOfficial && b.isOfficial) return 1;

      const confA = a.alsoReportedBy?.length || 0;
      const confB = b.alsoReportedBy?.length || 0;
      if (confA !== confB) return confB - confA;

      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  } else if (!query.league && !query.leagueIds?.length) {
    // Club Mode: Filter strictly by selected club ID
    const targetClubId = query.selectedClubId || query.clubIds?.[0];
    if (targetClubId) {
      items = items.filter(
        (item) =>
          item.currentClub?.id === targetClubId ||
          item.destinationClub?.id === targetClubId ||
          item.relatedClubIds.includes(targetClubId)
      );
    }
  }

  // Filter by status if requested
  if (query.status) {
    items = items.filter((item) => item.transferStatus === query.status);
  }

  // Search filter
  if (query.search) {
    const s = query.search.toLowerCase();
    items = items.filter(
      (item) =>
        item.headline.toLowerCase().includes(s) ||
        item.summary.toLowerCase().includes(s) ||
        (item.playerName && item.playerName.toLowerCase().includes(s))
    );
  }

  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total: items.length,
      hasMore: start + limit < items.length,
    },
    meta: {
      provider: 'multi-provider',
      lastUpdated: data[0]?.updatedAt ?? new Date().toISOString(),
      selectedClub: query.selectedClubId ?? query.club ?? null,
    },
  };
}

export function getNewsItemById(id: string): Promise<TransferNewsItem | null> {
  return multiProvider.getTransferNewsWithHealth({ mode: 'global', page: 1, limit: 100 }).then((res) => res.data.find((item) => item.id === id) ?? null);
}