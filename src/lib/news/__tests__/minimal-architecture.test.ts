import { describe, it, expect } from 'vitest';
import { getTransferNews } from '../get-transfer-news';
import { leagues, getClubsForLeague, getLeagueBySlug } from '@/config/leagues';
import { clubs } from '@/config/clubs';

describe('Minimal Content-First Architecture Unit Tests', () => {
  it('1. Overall feed works without requiring a club selection', async () => {
    const res = await getTransferNews({ mode: 'global' });
    expect(res.data).toBeDefined();
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.meta.selectedClub).toBeNull();
  }, 15000);

  it('2. Central league hierarchy contains only valid supported clubs', () => {
    const supportedClubIds = new Set(clubs.map((c) => c.id));
    leagues.forEach((league) => {
      expect(league.id).toBeDefined();
      expect(league.clubIds.length).toBeGreaterThan(0);
      league.clubIds.forEach((clubId) => {
        expect(supportedClubIds.has(clubId)).toBe(true);
      });
    });
  });

  it('3. League filtering returns news only involving clubs in that league', async () => {
    const pl = getLeagueBySlug('premier-league');
    expect(pl).not.toBeNull();

    const res = await getTransferNews({ mode: 'global', league: 'premier-league' });
    expect(res.data).toBeDefined();

    const allowedSet = new Set(pl!.clubIds);
    res.data.forEach((item) => {
      const match =
        (item.currentClub?.id && allowedSet.has(item.currentClub.id)) ||
        (item.destinationClub?.id && allowedSet.has(item.destinationClub.id)) ||
        item.relatedClubIds.some((id) => allowedSet.has(id));
      expect(match).toBe(true);
    });
  });

  it('4. Club hub query strictly filters claims involving the selected club', async () => {
    const res = await getTransferNews({ mode: 'club', selectedClubId: 'liverpool' });
    expect(res.data).toBeDefined();
    res.data.forEach((item) => {
      const match =
        item.currentClub?.id === 'liverpool' ||
        item.destinationClub?.id === 'liverpool' ||
        item.relatedClubIds.includes('liverpool');
      expect(match).toBe(true);
    });
  });

  it('5. Unsupported or fake clubs are rejected and return null from lookup helpers', () => {
    const invalidLeague = getLeagueBySlug('fake-league-xyz');
    expect(invalidLeague).toBeNull();

    const invalidClubs = getClubsForLeague('fake-league-xyz');
    expect(invalidClubs).toEqual([]);
  });

  it('6. Following mode supports query by array of followed club IDs', async () => {
    const res = await getTransferNews({ mode: 'club', clubIds: ['liverpool', 'real-madrid'] });
    expect(res.data).toBeDefined();
    res.data.forEach((item) => {
      const match =
        item.currentClub?.id === 'liverpool' ||
        item.destinationClub?.id === 'liverpool' ||
        item.currentClub?.id === 'real-madrid' ||
        item.destinationClub?.id === 'real-madrid' ||
        item.relatedClubIds.includes('liverpool') ||
        item.relatedClubIds.includes('real-madrid');
      expect(match).toBe(true);
    });
  });

  it('7. Excludes non-transfer news items from public feeds', async () => {
    const res = await getTransferNews({ mode: 'global' });
    res.data.forEach((item) => {
      expect(item.transferStatus).not.toBe('not_transfer_news');
    });
  });
});
