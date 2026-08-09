import type { TransferSourceAdapter, TransferSourceQuery, RawTransferSourceItem, SourceHealthResult } from './source-adapter';
import { bbcRssProvider } from './bbc-rss-provider';
import { guardianProvider } from './guardian-provider';
import { xApiSourceAdapter } from './x-provider';
import { RssSourceAdapter } from './rss-provider';
import { isTrustedSource } from '../filter-trusted-sources';
import { scoreReliability } from '../score-reliability';
import { calculateReliabilityScore } from '@/config/trusted-sources';
import { classifyTransferStatus } from '../classify-transfer-status';
import { resolveTransferEntities } from '../resolve-transfer-entities';
import { determineEvidenceLevel, detectReportRelationship } from '../confidence-progression';
import { articleRepository } from '@/lib/storage/article-repository';
import type { TransferNewsItem } from '@/types/news';

export class MultiSourceOrchestrator {
  private adapters: TransferSourceAdapter[] = [];

  constructor() {
    // Register adapters
    this.adapters = [
      xApiSourceAdapter,
      new RssSourceAdapter({
        id: 'bbc-rss',
        displayName: 'BBC Sport',
        feedUrl: 'https://feeds.bbci.co.uk/sport/football/rss.xml',
        sourceDomain: 'bbc.com',
        sourceTier: 'tier_1',
        enabled: true,
      }),
      new RssSourceAdapter({
        id: 'official-liverpool-rss',
        displayName: 'Liverpool FC Official',
        feedUrl: 'https://www.liverpoolfc.com/news/rss',
        sourceDomain: 'liverpoolfc.com',
        sourceTier: 'official',
        enabled: true,
      }),
    ];
  }

  async fetchAllSources(query: TransferSourceQuery = {}): Promise<{
    items: TransferNewsItem[];
    telemetry: SourceHealthResult[];
  }> {
    const activeAdapters = this.adapters.filter((a) => a.enabled);

    const settledResults = await Promise.allSettled(
      activeAdapters.map(async (adapter) => {
        const start = performance.now();
        const rawItems = await adapter.fetchUpdates(query);
        const durationMs = performance.now() - start;

        return {
          adapter,
          rawItems,
          health: {
            providerId: adapter.id,
            status: 'success' as const,
            fetchedCount: rawItems.length,
            acceptedCount: rawItems.length,
            rejectedCount: 0,
            duplicateCount: 0,
            lastSuccessfulFetch: new Date().toISOString(),
            lastError: null,
          },
        };
      })
    );

    const telemetry: SourceHealthResult[] = [];
    const allRawItems: RawTransferSourceItem[] = [];

    settledResults.forEach((res, idx) => {
      const adapter = activeAdapters[idx];
      if (res.status === 'fulfilled') {
        telemetry.push(res.value.health);
        allRawItems.push(...res.value.rawItems);
      } else {
        telemetry.push({
          providerId: adapter.id,
          status: 'failed',
          fetchedCount: 0,
          acceptedCount: 0,
          rejectedCount: 0,
          duplicateCount: 0,
          lastSuccessfulFetch: null,
          lastError: String(res.reason),
        });
      }
    });

    // Unified Pipeline processing
    const processedItems: TransferNewsItem[] = [];

    for (const raw of allRawItems) {
      if (!isTrustedSource(raw.sourceDomain || '', raw.authorName)) {
        continue;
      }

      const evidenceLevel = determineEvidenceLevel(raw.sourceType, 'tier_1', raw.headline);
      const isOfficialEvidence = evidenceLevel === 'official_confirmation';
      const entityRes = resolveTransferEntities(raw.headline, raw.description || '');
      const transferStatus = classifyTransferStatus(raw.headline, raw.description || '', isOfficialEvidence);

      if (transferStatus === 'not_transfer_news') continue;

      const relLevel = scoreReliability('tier_1', raw.authorName, isOfficialEvidence);
      const relScore = calculateReliabilityScore({
        sourceDomain: raw.sourceDomain || 'x.com',
        journalistName: raw.authorName,
        isOfficial: isOfficialEvidence,
        publishedAt: raw.publishedAt,
      });

      const itemDirection = entityRes.destinationClub ? 'incoming' : entityRes.currentClub ? 'outgoing' : 'related';

      const item: TransferNewsItem = {
        id: raw.externalId,
        headline: raw.headline,
        summary: raw.description || raw.headline,
        playerName: entityRes.playerName,
        playerImageUrl: null,
        currentClub: entityRes.currentClub,
        destinationClub: entityRes.destinationClub,
        relatedClubIds: entityRes.relatedClubIds,
        direction: itemDirection,
        sourceName: raw.sourceName,
        sourceDomain: raw.sourceDomain || 'x.com',
        sourceUrl: raw.originalUrl,
        journalistName: raw.authorName,
        reliability: relLevel,
        transferStatus,
        evidenceLevel,
        provenance: {
          originalReporterId: raw.authorName,
          originalPostId: raw.socialPostId,
          originalArticleUrl: raw.originalUrl,
          discoveredThroughProvider: raw.providerId,
          isOriginalReport: true,
          isRepost: false,
          isQuotePost: false,
          isSecondaryReport: false,
        },
        publishedAt: raw.publishedAt,
        updatedAt: raw.fetchedAt,
        imageUrl: raw.imageUrl,
        isOfficial: isOfficialEvidence,
        duplicateGroupId: null,
      };

      // Persist accepted report
      await articleRepository.saveArticle({
        id: item.id,
        provider: raw.providerId,
        externalId: raw.externalId,
        sourceUrl: raw.originalUrl,
        canonicalUrl: raw.canonicalUrl || raw.originalUrl,
        headline: item.headline,
        description: item.summary,
        cleanedText: item.summary,
        sourceName: item.sourceName,
        sourceDomain: item.sourceDomain,
        journalistName: item.journalistName,
        playerName: item.playerName,
        currentClubId: item.currentClub?.id || null,
        destinationClubId: item.destinationClub?.id || null,
        interestedClubId: null,
        leagueId: null,
        transferStatus: item.transferStatus,
        transferDirection: item.direction,
        reliabilityScore: relScore.score,
        publishedAt: new Date(item.publishedAt),
        humanReviewed: false,
        humanReviewedLabel: null,
        embeddingStatus: 'pending',
        embeddingModel: null,
        duplicateGroupId: null,
      });

      processedItems.push(item);
    }

    return { items: processedItems, telemetry };
  }
}

export const multiSourceOrchestrator = new MultiSourceOrchestrator();
