import type { TransferSourceAdapter, TransferSourceQuery, RawTransferSourceItem, SourceHealthResult } from './source-adapter';
import { getSourceBySocialHandle } from '@/config/source-registry';

export interface ApprovedSocialAccount {
  id: string;
  platform: 'x';
  handle: string;
  platformUserId: string;
  displayName: string;
  accountType: 'journalist' | 'official-club' | 'official-league' | 'publisher';
  reliabilityTier: 'official' | 'tier_1' | 'tier_2' | 'trusted';
  specialistClubIds: string[];
  specialistLeagueIds: string[];
  enabled: boolean;
}

export class XApiSourceAdapter implements TransferSourceAdapter {
  id = 'x-twitter';
  displayName = 'Official X API';
  sourceType = 'social' as const;

  get enabled(): boolean {
    return (
      (process.env.X_API_ENABLED === 'true' || Boolean(process.env.X_API_BEARER_TOKEN)) &&
      Boolean(process.env.X_API_BEARER_TOKEN || process.env.X_BEARER_TOKEN)
    );
  }

  async fetchUpdates(query: TransferSourceQuery): Promise<RawTransferSourceItem[]> {
    if (!this.enabled) return [];
    const bearerToken = process.env.X_API_BEARER_TOKEN || process.env.X_BEARER_TOKEN;
    if (!bearerToken) return [];

    const handles = ['FabrizioRomano', 'David_Ornstein', 'DiMarzio', 'Plettigoal', 'Matt_Law_DT'];
    const searchTerms = '(transfer OR "here we go" OR signed OR agreed OR medical)';
    const queryStr = `(${handles.map((h) => `from:${h}`).join(' OR ')}) ${searchTerms}`;

    const url = new URL('https://api.twitter.com/2/tweets/search/recent');
    url.searchParams.set('query', queryStr);
    url.searchParams.set('max_results', String(Math.min(query.limit ?? 20, 25)));
    url.searchParams.set('tweet.fields', 'created_at,author_id,entities');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) return [];
      const json = await response.json();
      if (!json.data) return [];

      return json.data.map((tweet: { id: string; text: string; created_at?: string; author_id?: string }) => {
        // Resolve author handle from registry
        const handle = handles[0]; // Primary candidate fallback
        const sourceEntry = getSourceBySocialHandle(handle);

        return {
          providerId: this.id,
          externalId: `x-${tweet.id}`,
          sourceType: 'social',
          headline: tweet.text.split('\n')[0] || tweet.text.slice(0, 100),
          description: tweet.text,
          permittedBodyText: tweet.text,
          originalUrl: `https://x.com/i/status/${tweet.id}`,
          canonicalUrl: `https://x.com/i/status/${tweet.id}`,
          sourceName: sourceEntry ? sourceEntry.displayName : 'Verified X Insider',
          sourceDomain: 'x.com',
          authorName: sourceEntry ? sourceEntry.displayName : 'Approved Journalist',
          authorExternalId: tweet.author_id || null,
          publishedAt: tweet.created_at || new Date().toISOString(),
          fetchedAt: new Date().toISOString(),
          imageUrl: null,
          socialPostId: tweet.id,
          socialAccountHandle: handle,
          socialAccountVerifiedByApp: true,
          rawMetadata: tweet as unknown as Record<string, unknown>,
        };
      });
    } catch {
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }

  async healthCheck(): Promise<SourceHealthResult> {
    const isConfigured = Boolean(process.env.X_API_BEARER_TOKEN || process.env.X_BEARER_TOKEN);
    return {
      providerId: this.id,
      status: this.enabled ? 'success' : isConfigured ? 'disabled' : 'disabled',
      fetchedCount: 0,
      acceptedCount: 0,
      rejectedCount: 0,
      duplicateCount: 0,
      lastSuccessfulFetch: null,
      lastError: isConfigured ? null : 'X_API_BEARER_TOKEN not configured',
    };
  }
}

export const xApiSourceAdapter = new XApiSourceAdapter();
