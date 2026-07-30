import { mockNews } from '../mock-data';
import type { NewsProvider, RawNewsArticle, TransferNewsQuery } from './provider-types';

export const mockNewsProvider: NewsProvider = {
  id: 'mock',
  enabled: true,

  async getTransferNews(options: TransferNewsQuery): Promise<RawNewsArticle[]> {
    const rawArticles: RawNewsArticle[] = mockNews.map((item): RawNewsArticle => ({
      externalId: item.id,
      headline: item.headline,
      description: item.summary,
      bodyText: null,
      sourceName: item.sourceName,
      sourceDomain: item.sourceDomain,
      sourceUrl: item.sourceUrl,
      journalistName: item.journalistName,
      publishedAt: item.publishedAt,
      imageUrl: item.imageUrl,
      relatedClubHints: item.relatedClubIds,
      provider: 'mock',
    }));

    const search = options.search?.toLowerCase().trim();

    const filtered = rawArticles.filter((item) => {
      if (options.clubIds?.length && !options.clubIds.some((clubId) => item.relatedClubHints.includes(clubId))) return false;
      if (search && !`${item.headline} ${item.description || ''} ${item.sourceName}`.toLowerCase().includes(search)) return false;
      return true;
    });

    return filtered.slice(0, options.limit ?? 20);
  },
};