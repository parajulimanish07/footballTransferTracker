import type { NewsProvider, RawNewsArticle, TransferNewsQuery } from './provider-types';
import { guardianProvider } from './guardian-provider';
import { bbcRssProvider } from './bbc-rss-provider';
import { officialClubProvider } from './official-club-provider';
import { gnewsProvider } from './gnews-provider';
import { manualProvider } from './manual-provider';
import { xTwitterProvider } from './x-twitter-provider';
import { apiFootballProvider } from './api-football-provider';
import { newsApiProvider } from './news-api-provider';
import { mockNewsProvider } from './mock-provider';

import { isTrustedSource } from '../filter-trusted-sources';
import { scoreReliability, reliabilityRank } from '../score-reliability';
import { matchClubs } from '../match-clubs';
import { classifyTransferStatus } from '../classify-transfer-status';
import { resolveTransferEntities } from '../resolve-transfer-entities';
import { predictTransferStatus, detectDuplicates } from '@/lib/ml/ml-client';
import { articleRepository } from '@/lib/storage/article-repository';
import type { TransferNewsItem, TransferStatus } from '@/types/news';

export interface ProviderHealthMeta {
  id: string;
  status: 'success' | 'failed' | 'disabled';
  articleCount: number;
  error?: string;
}

export interface MultiProviderResponse {
  data: TransferNewsItem[];
  providerHealth: ProviderHealthMeta[];
}

export const registeredProviders: NewsProvider[] = [
  guardianProvider,
  bbcRssProvider,
  officialClubProvider,
  manualProvider,
  apiFootballProvider,
  xTwitterProvider,
  gnewsProvider,
  newsApiProvider,
];

export const multiProvider = {
  id: 'multi-provider',
  enabled: true,

  async getTransferNewsWithHealth(query: TransferNewsQuery): Promise<MultiProviderResponse> {
    const healthMeta: ProviderHealthMeta[] = [];
    const rawArticles: RawNewsArticle[] = [];

    // Filter enabled providers according to env
    const enabledNames = (process.env.NEWS_PROVIDERS || 'guardian,bbc-rss,official-club,manual,api-football,newsapi')
      .toLowerCase()
      .split(',')
      .map((s) => s.trim());

    const activeProviders = registeredProviders.filter((p) => enabledNames.includes(p.id) && p.enabled);

    // 1. Run enabled providers independently via Promise.allSettled
    const results = await Promise.allSettled(
      activeProviders.map(async (provider) => {
        const articles = await provider.getTransferNews(query);
        return { providerId: provider.id, articles };
      })
    );

    // Record provider health telemetry
    registeredProviders.forEach((provider) => {
      const isConfigured = enabledNames.includes(provider.id) && provider.enabled;
      if (!isConfigured) {
        healthMeta.push({ id: provider.id, status: 'disabled', articleCount: 0 });
        return;
      }

      const match = results.find(
        (r) => r.status === 'fulfilled' && r.value.providerId === provider.id
      );

      if (match && match.status === 'fulfilled') {
        const count = match.value.articles.length;
        healthMeta.push({ id: provider.id, status: 'success', articleCount: count });
        rawArticles.push(...match.value.articles);
      } else {
        const errMatch = results.find(
          (r) => r.status === 'rejected' && (r as any).providerId === provider.id
        );
        healthMeta.push({
          id: provider.id,
          status: 'failed',
          articleCount: 0,
          error: 'Provider fetch timeout or API error',
        });
      }
    });

    // Development fallback to mock data if zero live articles returned
    if (!rawArticles.length && (process.env.NEWS_PROVIDER === 'mock' || !process.env.GUARDIAN_API_KEY)) {
      const mockRaw = await mockNewsProvider.getTransferNews(query);
      rawArticles.push(...mockRaw);
    }

    // 2. Remove exact URL duplicates
    const urlMap = new Map<string, RawNewsArticle>();
    rawArticles.forEach((art) => {
      if (!urlMap.has(art.sourceUrl)) {
        urlMap.set(art.sourceUrl, art);
      }
    });
    const uniqueRaw = Array.from(urlMap.values());

    // Save raw records to repository
    uniqueRaw.forEach((art) => articleRepository.saveRawArticle(art));

    // 3. Trusted-source filtering
    const trustedRaw = uniqueRaw.filter((art) => isTrustedSource(art.sourceDomain, art.journalistName));

    // 4. Transform into TransferNewsItem & run ML predictions
    const processedItems: TransferNewsItem[] = await Promise.all(
      trustedRaw.map(async (art): Promise<TransferNewsItem> => {
        const isOfficial = art.provider === 'official-club' || art.sourceDomain === 'official' || art.sourceDomain.includes('premierleague.com');
        const resolved = resolveTransferEntities(art.headline, art.description || '');

        // Machine learning transfer-status prediction
        const mlRes = await predictTransferStatus({
          headline: art.headline,
          description: art.description,
          sourceDomain: art.sourceDomain,
          isOfficial,
        });

        const reliability = isOfficial ? 'official' : scoreReliability('trusted', art.journalistName, isOfficial);
        const transferStatus: TransferStatus = (mlRes.prediction as TransferStatus) || classifyTransferStatus(art.headline, art.description || '', isOfficial);

        const newsItem: TransferNewsItem = {
          id: art.externalId,
          headline: art.headline,
          summary: art.description || art.headline,
          playerName: resolved.playerName,
          playerImageUrl: art.imageUrl,
          currentClub: resolved.currentClub,
          destinationClub: resolved.destinationClub,
          relatedClubIds: resolved.relatedClubIds,
          direction: resolved.destinationClub ? 'incoming' : resolved.currentClub ? 'outgoing' : 'related',
          sourceName: art.sourceName,
          sourceDomain: art.sourceDomain,
          sourceUrl: art.sourceUrl,
          journalistName: art.journalistName,
          reliability,
          transferStatus,
          publishedAt: art.publishedAt,
          updatedAt: art.publishedAt,
          imageUrl: art.imageUrl,
          isOfficial,
          duplicateGroupId: null,
        };

        // Update repository
        articleRepository.updateProcessedArticle(art.externalId, {
          processingStatus: mlRes.needsReview ? 'needs_review' : 'processed',
          mlPrediction: transferStatus,
          confidence: mlRes.confidence,
          reliabilityScore: isOfficial ? 100 : 85,
          processedNewsItem: newsItem,
        });

        return newsItem;
      })
    );

    // 5. TF-IDF Duplicate Detection & Primary Story Selection
    const groupedItems = selectPrimaryStoriesAndGroupDuplicates(processedItems);

    return {
      data: groupedItems,
      providerHealth: healthMeta,
    };
  },
};

/**
 * Groups stories by similarity and selects primary story using authority hierarchy:
 * Official > Tier 1 Journalist > Highest Reliability > Earliest Credible Report
 */
function selectPrimaryStoriesAndGroupDuplicates(items: TransferNewsItem[]): TransferNewsItem[] {
  if (items.length <= 1) return items;

  const result: TransferNewsItem[] = [];
  const visited = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const target = items[i];
    if (visited.has(target.id)) continue;

    visited.add(target.id);
    const duplicatesGroup: TransferNewsItem[] = [target];

    for (let j = i + 1; j < items.length; j++) {
      const candidate = items[j];
      if (visited.has(candidate.id)) continue;

      if (isDuplicateStory(target, candidate)) {
        visited.add(candidate.id);
        duplicatesGroup.push(candidate);
      }
    }

    // Primary selection algorithm
    duplicatesGroup.sort((a, b) => {
      // 1. Official first
      if (a.isOfficial && !b.isOfficial) return -1;
      if (!a.isOfficial && b.isOfficial) return 1;

      // 2. Reliability rank
      const relDiff = reliabilityRank(b.reliability) - reliabilityRank(a.reliability);
      if (relDiff !== 0) return relDiff;

      // 3. Earliest published date
      return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
    });

    const primary = duplicatesGroup[0];
    const alsoReported = duplicatesGroup.slice(1).map((item) => item.sourceName);

    result.push({
      ...primary,
      duplicateGroupId: duplicatesGroup.length > 1 ? `group-${primary.id}` : null,
      alsoReportedBy: alsoReported.length ? alsoReported : undefined,
    });
  }

  return result;
}

function isDuplicateStory(a: TransferNewsItem, b: TransferNewsItem): boolean {
  // Same player
  if (a.playerName && b.playerName && a.playerName.toLowerCase() === b.playerName.toLowerCase()) {
    const sharedClubs = a.relatedClubIds.some((id) => b.relatedClubIds.includes(id));
    if (sharedClubs) return true;
  }

  // High headline token similarity
  const tokensA = new Set(a.headline.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  const tokensB = new Set(b.headline.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  const intersection = new Set([...tokensA].filter((x) => tokensB.has(x)));

  if (tokensA.size > 0 && intersection.size / tokensA.size >= 0.65) {
    return true;
  }

  return false;
}

function extractPlayerNameFromText(text: string): string | null {
  const knowns = ['Declan Rice', 'Riccardo Calafiori', 'Darwin Nunez', 'Kylian Mbappe', 'Joshua Zirkzee', 'Victor Osimhen', 'Moises Caicedo', 'Leny Yoro', 'Teun Koopmeiners', 'Luis Diaz', 'Aaron Ramsdale'];
  return knowns.find((name) => text.toLowerCase().includes(name.toLowerCase())) ?? null;
}
