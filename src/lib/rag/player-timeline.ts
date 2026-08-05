import { articleRepository, StoredTransferArticle } from '@/lib/storage/article-repository';
import type { TransferStatus } from '@/types/news';

export interface TimelineEntry {
  date: string;
  stage: string;
  transferStatus: TransferStatus;
  headline: string;
  sourceName: string;
  sourceUrl: string;
  articleId: string;
}

export interface PlayerTransferTimeline {
  playerName: string;
  entries: TimelineEntry[];
  latestStatus: TransferStatus | null;
  totalVerifiedReports: number;
}

const STAGE_LABELS: Record<TransferStatus, string> = {
  interest: 'Interest reported',
  approach_made: 'Approach made',
  bid_submitted: 'Bid submitted',
  negotiations: 'Negotiations ongoing',
  advanced_talks: 'Advanced talks',
  agreement_reached: 'Agreement reached',
  official: 'Official announcement',
  departure_expected: 'Departure expected',
  not_transfer_news: 'General news',
};

export async function getPlayerTransferTimeline(playerName: string): Promise<PlayerTransferTimeline> {
  const articles = await articleRepository.queryArticles({ playerName });

  // Exclude non-transfer stories and sort chronologically (oldest to newest)
  const valid = articles
    .filter((a) => a.transferStatus !== 'not_transfer_news')
    .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());

  // Group exact/near duplicates
  const deduplicated: StoredTransferArticle[] = [];
  const seenGroupIds = new Set<string>();

  for (const item of valid) {
    const groupId = item.duplicateGroupId || item.contentHash;
    if (!seenGroupIds.has(groupId)) {
      seenGroupIds.add(groupId);
      deduplicated.push(item);
    }
  }

  const entries: TimelineEntry[] = deduplicated.map((article) => ({
    date: new Date(article.publishedAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    }),
    stage: STAGE_LABELS[article.transferStatus] || 'Reported',
    transferStatus: article.transferStatus,
    headline: article.headline,
    sourceName: article.sourceName,
    sourceUrl: article.sourceUrl,
    articleId: article.id,
  }));

  const latestStatus = deduplicated.length ? deduplicated[deduplicated.length - 1].transferStatus : null;

  return {
    playerName,
    entries,
    latestStatus,
    totalVerifiedReports: deduplicated.length,
  };
}
