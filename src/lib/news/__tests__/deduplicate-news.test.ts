import { describe, expect, it } from 'vitest';
import { deduplicateNews } from '../deduplicate-news';

describe('deduplicateNews', () => {
  it('keeps one primary story per duplicate group', () => {
    const items = deduplicateNews([
      {
        id: '1', headline: 'Deal agreed for player', summary: '', playerName: 'Player One', playerImageUrl: null, currentClub: null, destinationClub: null, relatedClubIds: ['a'], direction: 'incoming', sourceName: 'A', sourceDomain: 'bbc.com', sourceUrl: 'https://example.com/a', journalistName: 'Simon Stone', reliability: 'trusted', transferStatus: 'agreement_reached', publishedAt: '2026-07-29T10:00:00.000Z', updatedAt: '2026-07-29T10:00:00.000Z', imageUrl: null, isOfficial: false, duplicateGroupId: 'group-1',
      },
      {
        id: '2', headline: 'Deal agreed for player', summary: '', playerName: 'Player One', playerImageUrl: null, currentClub: null, destinationClub: null, relatedClubIds: ['a'], direction: 'incoming', sourceName: 'B', sourceDomain: 'theathletic.com', journalistName: 'David Ornstein', sourceUrl: 'https://example.com/b', reliability: 'tier_1', transferStatus: 'agreement_reached', publishedAt: '2026-07-29T10:05:00.000Z', updatedAt: '2026-07-29T10:05:00.000Z', imageUrl: null, isOfficial: false, duplicateGroupId: 'group-1',
      },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0].alsoReportedBy).toContain('B');
  });
});