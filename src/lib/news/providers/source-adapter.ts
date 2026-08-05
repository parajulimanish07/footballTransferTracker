export interface TransferSourceQuery {
  clubIds?: string[];
  leagueIds?: string[];
  journalistIds?: string[];
  publishedAfter?: string;
  publishedBefore?: string;
  limit?: number;
}

export interface RawTransferSourceItem {
  providerId: string;
  externalId: string;
  sourceType: 'rss' | 'news-api' | 'official-club' | 'social' | 'manual';
  headline: string;
  description: string | null;
  permittedBodyText: string | null;
  originalUrl: string;
  canonicalUrl: string | null;
  sourceName: string;
  sourceDomain: string | null;
  authorName: string | null;
  authorExternalId: string | null;
  publishedAt: string;
  fetchedAt: string;
  imageUrl: string | null;
  socialPostId: string | null;
  socialAccountHandle: string | null;
  socialAccountVerifiedByApp: boolean;
  rawMetadata: Record<string, unknown>;
}

export interface SourceHealthResult {
  providerId: string;
  status: 'success' | 'partial' | 'rate_limited' | 'failed' | 'disabled';
  fetchedCount: number;
  acceptedCount: number;
  rejectedCount: number;
  duplicateCount: number;
  lastSuccessfulFetch: string | null;
  lastError: string | null;
}

export interface TransferSourceAdapter {
  id: string;
  displayName: string;
  sourceType: 'rss' | 'news-api' | 'official-club' | 'social' | 'manual';
  enabled: boolean;
  fetchUpdates(query: TransferSourceQuery): Promise<RawTransferSourceItem[]>;
  healthCheck?(): Promise<SourceHealthResult>;
}
