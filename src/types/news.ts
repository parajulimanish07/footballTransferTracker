import type { ClubSummary } from './club';
import type { ReliabilityLevel, TrustedSource, Journalist } from './source';

export type FeedMode = 'global' | 'club';

export interface FeedContext {
  mode: FeedMode;
  selectedClubId: string | null;
}

export type FeedPreference =
  | {
      mode: 'global';
      clubIds: [];
    }
  | {
      mode: 'clubs';
      clubIds: string[];
    };

export interface UserFeedSettings {
  defaultMode: FeedMode;
  defaultClubId: string | null;
  followedClubIds: string[];
}

export type EvidenceLevel =
  | 'official_confirmation'
  | 'trusted_report'
  | 'early_signal'
  | 'secondary_confirmation';

export interface SourceProvenance {
  originalReporterId: string | null;
  originalPostId: string | null;
  originalArticleUrl: string | null;
  discoveredThroughProvider: string;
  isOriginalReport: boolean;
  isRepost: boolean;
  isQuotePost: boolean;
  isSecondaryReport: boolean;
}

export type TransferStatus =
  | 'official'
  | 'agreement_reached'
  | 'advanced_talks'
  | 'negotiations'
  | 'bid_submitted'
  | 'approach_made'
  | 'interest'
  | 'departure_expected'
  | 'not_transfer_news';

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
  evidenceLevel?: EvidenceLevel;
  provenance?: SourceProvenance;
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
  mode?: FeedMode;
  club?: string | null;
  clubs?: string[] | null;
  league?: string | null;
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