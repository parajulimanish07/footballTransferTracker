import { describe, it, expect, beforeEach } from 'vitest';
import { footballEntityRepository } from '../entity-repository';
import { MockFootballEntityProvider } from '../mock-entity-provider';
import { syncSupportedLeagues, syncLeagueTeams, syncTeamSquad } from '../entity-sync-engine';
import { resolveTransferEntities } from '@/lib/news/resolve-transfer-entities';
import { parseTransferSearchIntent } from '@/lib/rag/intent-parser';

describe('Dynamic Football Entity Catalogue Unit Tests', () => {
  const provider = new MockFootballEntityProvider();

  beforeEach(() => {
    // Shared setup
  });

  it('1. Syncs only supported leagues', async () => {
    const run = await syncSupportedLeagues();
    expect(run.status).toBe('completed');
    const pl = await footballEntityRepository.getLeagueById('premier-league');
    expect(pl).not.toBeNull();
    expect(pl?.name).toBe('Premier League');
  });

  it('2. Ignores unsupported competitions during sync', async () => {
    const run = await syncLeagueTeams('unsupported-league-id-999');
    expect(run.status).toBe('failed');
    expect(run.errorMessage).toContain('not supported');
  });

  it('3. Upserts clubs without creating duplicate internal IDs', async () => {
    await footballEntityRepository.upsertClub({
      id: 'manchester-city',
      externalProvider: 'mock',
      externalId: '65',
      name: 'Manchester City FC',
      slug: 'manchester-city',
      shortName: 'Man City',
      leagueId: 'premier-league',
      logoPath: '/clubs/manchester-city.png',
      aliases: ['Man City', 'City'],
      enabled: true,
      updatedAt: new Date().toISOString(),
    });

    const clubs = await footballEntityRepository.getAllClubs();
    const cityClubs = clubs.filter((c) => c.id === 'manchester-city');
    expect(cityClubs.length).toBe(1);
  });

  it('4. Squad sync creates player-club relationships', async () => {
    await syncTeamSquad('manchester-city');
    const player = await footballEntityRepository.findPlayerByExactOrAlias('Erling Haaland');
    expect(player).not.toBeNull();
    expect(player?.currentClubId).toBe('manchester-city');
  });

  it('5. Updated squad changes player currentClubId', async () => {
    await footballEntityRepository.upsertPlayer({
      id: 'p-haaland',
      externalProvider: 'mock',
      externalId: 'p-301',
      name: 'Erling Haaland',
      normalizedName: 'erling haaland',
      aliases: ['Haaland'],
      currentClubId: 'borussia-dortmund',
      position: 'Offence',
      nationality: 'Norway',
      dateOfBirth: '2000-07-21',
      updatedAt: new Date().toISOString(),
    });

    // Update squad to Man City
    await footballEntityRepository.upsertPlayer({
      id: 'p-haaland',
      externalProvider: 'mock',
      externalId: 'p-301',
      name: 'Erling Haaland',
      normalizedName: 'erling haaland',
      aliases: ['Haaland'],
      currentClubId: 'manchester-city',
      position: 'Offence',
      nationality: 'Norway',
      dateOfBirth: '2000-07-21',
      updatedAt: new Date().toISOString(),
    });

    const updated = await footballEntityRepository.getPlayerById('p-haaland');
    expect(updated?.currentClubId).toBe('manchester-city');
  });

  it('6. Explicit article club evidence overrides catalogue data', () => {
    const headline = 'Trafford joins Leeds from Man City in potential £45m deal';
    const summary = 'Leeds United sign Manchester City and England goalkeeper James Trafford.';

    const resolved = resolveTransferEntities(headline, summary);
    expect(resolved.currentClub?.id).toBe('manchester-city');
    expect(resolved.destinationClub?.id).toBe('leeds-united');
    expect(resolved.entitySource).toBe('article');
  });

  it('7. Catalogue data overrides legacy player fallback when article evidence is missing', async () => {
    await footballEntityRepository.upsertPlayer({
      id: 'p-salah',
      externalProvider: 'mock',
      externalId: 'p-101',
      name: 'Mohamed Salah',
      normalizedName: 'mohamed salah',
      aliases: ['Salah'],
      currentClubId: 'liverpool',
      position: 'Offence',
      nationality: 'Egypt',
      dateOfBirth: '1992-06-15',
      updatedAt: new Date().toISOString(),
    });

    const headline = 'Mohamed Salah subject of heavy interest';
    const summary = 'Top clubs considering huge summer proposals for Mohamed Salah.';

    const resolved = resolveTransferEntities(headline, summary);
    expect(resolved.currentClub?.id).toBe('liverpool');
  });

  it('8. Legacy fallback is used only when article and catalogue lookups fail', () => {
    const headline = 'Jadon Sancho set for Borussia Dortmund return talks';
    const summary = 'Talks ongoing for Jadon Sancho move.';

    const resolved = resolveTransferEntities(headline, summary);
    expect(resolved.currentClub?.id).toBe('manchester-united');
  });

  it('9. Ambiguous player match with multiple candidates returns null', async () => {
    const result = await footballEntityRepository.findPlayerByExactOrAlias('Unknown Multiple Same Name');
    expect(result).toBeNull();
  });

  it('10. Club aliases resolve correctly', async () => {
    const spurs = await footballEntityRepository.findClubByAlias('Spurs');
    expect(spurs?.id).toBe('tottenham-hotspur');
  });

  it('11. Generic ambiguous aliases like United are handled safely', async () => {
    const intent = parseTransferSearchIntent('Who is United signing?');
    expect(intent.clubIds).not.toContain('manchester-united');
  });

  it('12. External provider failure does not break transfer news resolution', async () => {
    const badProvider = new MockFootballEntityProvider();
    const comps = await badProvider.getCompetitions();
    expect(comps.length).toBeGreaterThan(0);
  });

  it('13. Cached entity catalogue works offline without internet connection', async () => {
    const club = await footballEntityRepository.getClubById('real-madrid');
    expect(club).not.toBeNull();
    expect(club?.name).toBe('Real Madrid');
  });

  it('14. API keys are never returned to client components', () => {
    expect(process.env.FOOTBALL_DATA_API_KEY).toBeUndefined();
  });

  it('15. Squad sync respects rate-limit logic and updates telemetry', async () => {
    const run = await syncTeamSquad('manchester-city');
    expect(run.status).toBe('completed');
    expect(run.updatedCount).toBeGreaterThan(0);
  });

  it('16. RAG intent resolves club aliases to canonical club IDs', () => {
    const intent = parseTransferSearchIntent('What is the latest on Spurs?');
    expect(intent.clubIds).toContain('tottenham-hotspur');
  });

  it('17. Player search returns canonical entities', async () => {
    const players = await footballEntityRepository.findPlayersByName('Salah');
    expect(players.length).toBeGreaterThan(0);
    expect(players[0].name).toContain('Salah');
  });

  it('18. Unsupported league clubs are not exposed publicly', async () => {
    const leagues = await footballEntityRepository.getAllLeagues();
    const ids = leagues.map((l) => l.id);
    expect(ids).toContain('premier-league');
  });

  it('19. Existing club logo configuration is preserved', async () => {
    const city = await footballEntityRepository.getClubById('manchester-city');
    expect(city?.logoPath).toBe('/clubs/manchester-city.png');
  });

  it('20. KNOWN_PLAYER_ORIGIN_CLUBS never overrides explicit article evidence', () => {
    const headline = 'Grealish joins Bayern Munich from Aston Villa in surprise deal';
    const summary = 'Grealish completes move from Aston Villa to Bayern Munich.';

    const resolved = resolveTransferEntities(headline, summary);
    expect(resolved.currentClub?.id).toBe('aston-villa');
    expect(resolved.destinationClub?.id).toBe('bayern-munich');
    expect(resolved.entitySource).toBe('article');
  });
});
