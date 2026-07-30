import type { TransferNewsItem } from '@/types/news';
import { differenceInMinutes } from 'date-fns';

function similarity(a: string, b: string) {
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  const intersection = [...wordsA].filter((word) => wordsB.has(word)).length;
  const union = new Set([...wordsA, ...wordsB]).size || 1;
  return intersection / union;
}

export function deduplicateNews(items: TransferNewsItem[]) {
  const groups = new Map<string, TransferNewsItem[]>();

  for (const item of items) {
    const groupKey = item.duplicateGroupId ?? `${item.playerName ?? 'unknown'}:${item.transferStatus}:${item.relatedClubIds.sort().join(',')}`;
    const existing = groups.get(groupKey) ?? [];
    existing.push(item);
    groups.set(groupKey, existing);
  }

  const output: TransferNewsItem[] = [];

  for (const group of groups.values()) {
    const sorted = [...group].sort((a, b) => {
      if (a.reliability !== b.reliability) return 0;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
    const primary = sorted[0];
    const alsoReportedBy = sorted.slice(1).map((item) => item.sourceName);
    output.push({
      ...primary,
      alsoReportedBy: alsoReportedBy.length ? alsoReportedBy : undefined,
    });
  }

  return output.sort((a, b) => {
    const timeDelta = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    if (timeDelta !== 0) return timeDelta;
    return 0;
  });
}

export function isDuplicateCandidate(a: TransferNewsItem, b: TransferNewsItem) {
  if (a.playerName && b.playerName && a.playerName.toLowerCase() === b.playerName.toLowerCase()) return true;
  if (a.transferStatus !== b.transferStatus) return false;
  const minutes = Math.abs(differenceInMinutes(new Date(a.publishedAt), new Date(b.publishedAt)));
  return minutes <= 180 && similarity(a.headline, b.headline) >= 0.45;
}