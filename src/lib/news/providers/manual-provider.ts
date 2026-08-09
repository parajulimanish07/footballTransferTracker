import type { NewsProvider, RawNewsArticle, TransferNewsQuery } from './provider-types';
import { articleRepository } from '@/lib/storage/article-repository';

export const manualProvider: NewsProvider = {
  id: 'manual',
  enabled: true,

  async getTransferNews(options: TransferNewsQuery): Promise<RawNewsArticle[]> {
    const allRecords = articleRepository.getAll();
    const manualArticles = allRecords
      .filter((rec: any) => rec.provider === 'manual')
      .map((rec: any): RawNewsArticle => ({
        externalId: rec.externalId,
        headline: rec.headline,
        description: rec.description,
        bodyText: rec.bodyText,
        sourceName: rec.sourceName,
        sourceDomain: rec.sourceDomain,
        sourceUrl: rec.sourceUrl,
        journalistName: rec.journalistName,
        publishedAt: rec.publishedAt,
        imageUrl: rec.imageUrl,
        relatedClubHints: rec.relatedClubHints,
        provider: 'manual',
      }));

    return manualArticles.slice(0, options.limit ?? 20);
  },
};
