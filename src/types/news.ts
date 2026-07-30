import type { ClubSummary } from './club';
import type { ReliabilityLevel, TrustedSource, Journalist } from './source';

export type TransferStatus =
  | 'official'
  | 'agreement_reached'
  | 'advanced_talks'
  | 'negotiations'
  | 'bid_submitted'
  | 'approach_made'
  | 'interest'
  | 'departure_expected';

export type TransferDirection = 'incoming' | 'outgoing' | 'related' | null;

export interface Player {
  id: string;
  name: string;
  currentClub: ClubSummary | null;
  position: string | null;
  nationality: string | null;
  imageUrl: string | null;
}

export interface TransferReport {
  id: string;
  headline: string;
  summary: string;
  sourceName: string;
  sourceDomain: string;
  sourceUrl: string;
  journalistName: string | null;
  publishedAt: string;
  updatedAt: string;
  rawUrl: string | null;
  canonicalUrl: string | null;
}

export interface TransferNewsItem {
  id: string;
  headline: string;
  summary: string;
  playerName: string | null;
  playerImageUrl: string | null;
  currentClub: ClubSummary | null;
  destinationClub: ClubSummary | null;
  relatedClubIds: string[];
  direction: TransferDirection;
  sourceName: string;
  sourceDomain: string;
  sourceUrl: string;
  journalistName: string | null;
  reliability: ReliabilityLevel;
  transferStatus: TransferStatus;
  publishedAt: string;
  updatedAt: string;
  imageUrl: string | null;
  isOfficial: boolean;
  duplicateGroupId: string | null;
  alsoReportedBy?: string[];
  source?: TrustedSource;
  journalist?: Journalist | null;
  demo?: boolean;
}

export interface NewsApiResponse {
  data: TransferNewsItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  meta: {
    provider: string;
    lastUpdated: string;
    selectedClub: string | null;
  };
}

export interface FilterState {
  club?: string | null;
  reliability?: ReliabilityLevel | null;
  status?: TransferStatus | null;
  direction?: Exclude<TransferDirection, null> | null;
  source?: string | null;
  journalist?: string | null;
  from?: string | null;
  to?: string | null;
  page?: number;
  limit?: number;
  sort?: 'latest' | 'most_reliable' | null;
  search?: string | null;
}