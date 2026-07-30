import { multiProvider } from './providers/multi-provider';
import type { FilterState, NewsApiResponse, TransferNewsItem } from '@/types/news';

export async function getTransferNews(filters: FilterState & { clubIds?: string[] } = {}): Promise<NewsApiResponse> {
  const result = await multiProvider.getTransferNewsWithHealth(filters);
  let items = result.data;

  // Filter by club if requested
  if (filters.clubIds?.length) {
    items = items.filter((item) =>
      filters.clubIds!.some(
        (id) => item.relatedClubIds.includes(id) || item.currentClub?.id === id || item.destinationClub?.id === id
      )
    );
  }

  // Search filter
  if (filters.search) {
    const s = filters.search.toLowerCase();
    items = items.filter(
      (item) =>
        item.headline.toLowerCase().includes(s) ||
        item.summary.toLowerCase().includes(s) ||
        (item.playerName && item.playerName.toLowerCase().includes(s))
    );
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
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
      selectedClub: filters.club ?? null,
    },
  };
}

export function getNewsItemById(id: string): Promise<TransferNewsItem | null> {
  return multiProvider.getTransferNewsWithHealth({ page: 1, limit: 100 }).then((res) => res.data.find((item) => item.id === id) ?? null);
}