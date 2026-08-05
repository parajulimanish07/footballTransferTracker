import type { TransferStatus, EvidenceLevel } from '@/types/news';

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

export type ReportRelationship = 'confirms' | 'updates' | 'contradicts' | 'corrects' | 'repeats';

export interface TransferStoryTimelineEvent {
  id: string;
  storyGroupId: string;
  sourceItemId: string;
  publishedAt: string;
  sourceName: string;
  authorName: string | null;
  transferStatus: TransferStatus;
  reliabilityScore: number;
  evidenceLevel: EvidenceLevel;
  relationship: ReportRelationship;
  summary: string;
}

export function determineEvidenceLevel(
  sourceType: 'rss' | 'news-api' | 'official-club' | 'social' | 'manual',
  reliabilityTier: 'official' | 'tier_1' | 'tier_2' | 'trusted',
  text: string
): EvidenceLevel {
  const t = text.toLowerCase();
  const isOfficialAccount = reliabilityTier === 'official' || sourceType === 'official-club';
  const mentionsOfficialSigning =
    t.includes('official') ||
    t.includes('complete') ||
    t.includes('announc') ||
    t.includes('signed') ||
    t.includes('confirm');

  if (isOfficialAccount && mentionsOfficialSigning) {
    return 'official_confirmation';
  }

  if (sourceType === 'social') {
    if (reliabilityTier === 'tier_1') {
      return t.includes('here we go') || t.includes('agreed') ? 'trusted_report' : 'early_signal';
    }
    return 'early_signal';
  }

  if (reliabilityTier === 'tier_1' || reliabilityTier === 'official') {
    return 'trusted_report';
  }

  return 'secondary_confirmation';
}

export function detectReportRelationship(headline: string, summary: string): ReportRelationship {
  const text = `${headline} ${summary}`.toLowerCase();

  if (text.includes('correction') || text.includes('correcting') || text.includes('mistake')) {
    return 'corrects';
  }

  if (
    text.includes('collapsed') ||
    text.includes('rejected') ||
    text.includes('denies') ||
    text.includes('no agreement') ||
    text.includes('reports are incorrect') ||
    text.includes('not interested')
  ) {
    return 'contradicts';
  }

  if (text.includes('repost') || text.includes('retweet') || text.includes('according to')) {
    return 'repeats';
  }

  if (text.includes('update') || text.includes('latest') || text.includes('progress')) {
    return 'updates';
  }

  return 'confirms';
}
