import type { FilterState } from '@/types/news';

export interface TransferNewsQuery extends FilterState {
  clubIds?: string[];
  selectedClubId?: string | null;
  forceRefresh?: boolean;
}

export interface RawNewsArticle {
  externalId: string;
  headline: string;
  description: string | null;
  bodyText: string | null;
  sourceName: string;
  sourceDomain: string;
  sourceUrl: string;
  journalistName: string | null;
  publishedAt: string;
  imageUrl: string | null;
  relatedClubHints: string[];
  provider:
    | 'guardian'
    | 'bbc-rss'
    | 'official-club'
    | 'gnews'
    | 'manual'
    | 'newsapi'
    | 'api-football'
    | 'x-twitter'
    | 'mock';
}

export interface NewsProvider {
  id: string;
  enabled: boolean;
  getTransferNews(query: TransferNewsQuery): Promise<RawNewsArticle[]>;
}
