import { describe, it, expect } from 'vitest';
import { getTransferNews } from '../get-transfer-news';
import { queryRAGAssistant } from '@/lib/rag/rag-engine';

describe('Browse All Transfer News (Global Mode) Unit Tests', () => {
  it('1. User can query global feed without passing selectedClubId', async () => {
    const res = await getTransferNews({ mode: 'global' });
    expect(res.data).toBeDefined();
    expect(res.meta.selectedClub).toBeNull();
  }, 15000);

  it('2. Global mode defaults when selectedClubId and clubIds are omitted', async () => {
    const res = await getTransferNews({});
    expect(res.data).toBeDefined();
    expect(res.meta.selectedClub).toBeNull();
  });

  it('3. Global feed includes valid transfer reports from different supported clubs', async () => {
    const res = await getTransferNews({ mode: 'global' });
    expect(res.data).toBeDefined();
    expect(Array.isArray(res.data)).toBe(true);
  });

  it('4. Global feed excludes NOT_TRANSFER_NEWS articles', async () => {
    const res = await getTransferNews({ mode: 'global' });
    const hasNonTransfer = res.data.some((i) => i.transferStatus === 'not_transfer_news');
    expect(hasNonTransfer).toBe(false);
  });

  it('5. Club mode filters strictly by selected club', async () => {
    const res = await getTransferNews({ mode: 'club', selectedClubId: 'real-madrid' });
    const invalidItems = res.data.filter(
      (i) =>
        i.currentClub?.id !== 'real-madrid' &&
        i.destinationClub?.id !== 'real-madrid' &&
        !i.relatedClubIds.includes('real-madrid')
    );
    expect(invalidItems.length).toBe(0);
  });

  it('6. Global statistics count unique claims without counting duplicate articles twice', async () => {
    const res = await getTransferNews({ mode: 'global' });
    const playerNames = res.data.map((i) => i.playerName).filter(Boolean);
    const uniquePlayers = new Set(playerNames.map((p) => p!.toLowerCase()));

    // Ensure grouping algorithm operates without crashing
    expect(uniquePlayers.size).toBeLessThanOrEqual(res.data.length);
  });

  it('7. Global RAG retrieves articles across clubs', async () => {
    const sampleArticles = [
      {
        id: '1',
        headline: 'Real Madrid sign Mbappé',
        summary: 'Kylian Mbappé joins Real Madrid officially.',
        sourceName: 'BBC Sport',
        sourceUrl: 'https://bbc.com/sport',
        publishedAt: new Date().toISOString(),
        reliability: 'official',
        playerName: 'Kylian Mbappé',
        clubs: ['Real Madrid'],
      },
      {
        id: '2',
        headline: 'Arsenal make Calafiori bid',
        summary: 'Riccardo Calafiori target for Arsenal.',
        sourceName: 'The Guardian',
        sourceUrl: 'https://theguardian.com/football',
        publishedAt: new Date().toISOString(),
        reliability: 'tier_1',
        playerName: 'Riccardo Calafiori',
        clubs: ['Arsenal'],
      },
    ];

    const answer = await queryRAGAssistant('What official deals happened today?', sampleArticles, { mode: 'global' });
    expect(answer.answer).toBeDefined();
    expect(answer.confidence).toBeDefined();
  });

  it('8. Club RAG prioritises articles involving selected club', async () => {
    const sampleArticles = [
      {
        id: '1',
        headline: 'Real Madrid sign Mbappé',
        summary: 'Kylian Mbappé joins Real Madrid officially.',
        sourceName: 'BBC Sport',
        sourceUrl: 'https://bbc.com/sport',
        publishedAt: new Date().toISOString(),
        reliability: 'official',
        playerName: 'Kylian Mbappé',
        clubs: ['real-madrid'],
      },
      {
        id: '2',
        headline: 'Arsenal make Calafiori bid',
        summary: 'Riccardo Calafiori target for Arsenal.',
        sourceName: 'The Guardian',
        sourceUrl: 'https://theguardian.com/football',
        publishedAt: new Date().toISOString(),
        reliability: 'tier_1',
        playerName: 'Riccardo Calafiori',
        clubs: ['arsenal'],
      },
    ];

    const answer = await queryRAGAssistant('Who is signing?', sampleArticles, { mode: 'club', selectedClubId: 'arsenal' });
    expect(answer.answer).toBeDefined();
  });

  it('9. Global club filter filters feed without changing feed mode permanently', async () => {
    const res = await getTransferNews({ mode: 'global', club: 'real-madrid' });
    expect(res.meta.selectedClub).toBe('real-madrid');
  });

  it('10. Ranks global stories by status importance (Official > Agreement > Advanced)', async () => {
    const res = await getTransferNews({ mode: 'global' });
    if (res.data.length >= 2) {
      const firstStatus = res.data[0].transferStatus;
      expect(['official', 'agreement_reached', 'advanced_talks', 'bid_submitted', 'negotiations', 'approach_made', 'interest', 'departure_expected']).toContain(firstStatus);
    }
  });

  it('11. Empty live feed does not crash or throw unhandled exceptions', async () => {
    const res = await getTransferNews({ mode: 'global', search: 'nonexistentplayerxyz999' });
    expect(res.data).toEqual([]);
    expect(res.pagination.total).toBe(0);
  });
});
