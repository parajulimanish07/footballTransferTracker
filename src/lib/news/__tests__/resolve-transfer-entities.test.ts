import { describe, it, expect } from 'vitest';
import { resolveTransferEntities, extractTransferClaims } from '../resolve-transfer-entities';
import { classifyTransferStatus, isTransferNews } from '../classify-transfer-status';

describe('Strict Transfer Entity Resolution & Pipeline Validation', () => {
  it('correctly associates player with current club and destination club without mixing up roundups', () => {
    const headline = "Real Madrid confident of Rodri deal - Thursday's gossip";
    const summary =
      "Real Madrid confident in securing a deal for Manchester City's Rodri, Inter Milan could rekindle move for Liverpool's Curtis Jones, Aston Villa have bid for Palmeiras forward Allan rejected, plus more.";

    const resolved = resolveTransferEntities(headline, summary);

    expect(resolved.playerName).toBe('Rodri');
    expect(resolved.currentClub?.name).toBe('Manchester City');
    expect(resolved.destinationClub?.name).toBe('Real Madrid');

    // Verify it NEVER falsely attributes Liverpool -> Real Madrid
    expect(resolved.currentClub?.name).not.toBe('Liverpool');
  });

  it('accurately extracts clause-level transfer claims for Example 1 multi-rumour gossip', () => {
    const headline = "Spurs make Osimhen approach - Monday's gossip";
    const summary =
      'Tottenham make an approach for Victor Osimhen, Atletico Madrid consider a move for Manchester City winger Jack Grealish, Liverpool forward Cody Gakpo has positive talks with Spurs, plus more.';

    const claims = extractTransferClaims(headline, summary);

    expect(claims.length).toBeGreaterThanOrEqual(3);

    // Claim 1: Victor Osimhen -> Tottenham
    const osimhenClaim = claims.find((c) => c.playerName === 'Victor Osimhen');
    expect(osimhenClaim).toBeDefined();
    expect(osimhenClaim?.destinationClubId).toBe('tottenham-hotspur');
    expect(osimhenClaim?.currentClubId).not.toBe('manchester-city');

    // Claim 2: Jack Grealish -> Manchester City to Atletico Madrid
    const grealishClaim = claims.find((c) => c.playerName === 'Jack Grealish');
    expect(grealishClaim).toBeDefined();
    expect(grealishClaim?.currentClubId).toBe('manchester-city');
    expect(grealishClaim?.destinationClubId).toBe('atletico-madrid');

    // Claim 3: Cody Gakpo -> Liverpool to Tottenham
    const gakpoClaim = claims.find((c) => c.playerName === 'Cody Gakpo');
    expect(gakpoClaim).toBeDefined();
    expect(gakpoClaim?.currentClubId).toBe('liverpool');
    expect(gakpoClaim?.destinationClubId).toBe('tottenham-hotspur');
  });

  it('classifies Example 2 profile/background article as NOT_TRANSFER_NEWS', () => {
    const headline = "Alonso heals Real Madrid scars to lead Chelsea's senior revolution";
    const summary =
      'Xabi Alonso on healing from his Real Madrid exit, his gut feeling to join Chelsea and why he sees his new club as an exciting opportunity.';

    const isTransfer = isTransferNews(headline, summary);
    const status = classifyTransferStatus(headline, summary, false);

    expect(isTransfer).toBe(false);
    expect(status).toBe('not_transfer_news');
  });

  it('accurately resolves target club specific sentence when viewing Manchester City vs Manchester United hubs', () => {
    const headline = "Salah close to Real Madrid move - Sunday's gossip";
    const summary =
      'Mohamed Salah edging towards a move to Real Madrid, Bayern Munich keen on Manchester United striker Benjamin Sesko and Man City boss Enzo Maresca wants to work with Chelsea winger Pedro Neto again.';

    // When viewing for Manchester United context
    const resolvedForManUtd = resolveTransferEntities(headline, summary, 'manchester-united');
    expect(resolvedForManUtd.playerName).toBe('Benjamin Sesko');
    expect(resolvedForManUtd.currentClub?.name).toBe('Manchester United');
    expect(resolvedForManUtd.destinationClub?.name).toBe('Bayern Munich');

    // When viewing for Manchester City context
    const resolvedForManCity = resolveTransferEntities(headline, summary, 'manchester-city');
    expect(resolvedForManCity.playerName).toBe('Pedro Neto');
    expect(resolvedForManCity.currentClub?.name).toBe('Chelsea');
    expect(resolvedForManCity.destinationClub?.name).toBe('Manchester City');

    // When viewing without club filter (default headline/first clause focus)
    const resolvedDefault = resolveTransferEntities(headline, summary);
    expect(resolvedDefault.playerName).toBe('Mohamed Salah');
    expect(resolvedDefault.destinationClub?.name).toBe('Real Madrid');
  });

  it('rejects identical currentClub and destinationClub (same club -> same club)', () => {
    const headline = "Real Madrid manager Xabi Alonso discusses Real Madrid's tactical progress";
    const summary = "Xabi Alonso praised Real Madrid's performance during a press conference.";

    const resolved = resolveTransferEntities(headline, summary, 'real-madrid');

    if (resolved.currentClub && resolved.destinationClub) {
      expect(resolved.currentClub.id).not.toBe(resolved.destinationClub.id);
    } else {
      expect(resolved.destinationClub).toBeNull();
    }
  });

  it('supports unknown current club with rumoured destination only', () => {
    const headline = 'Real Madrid interested in signing Victor Osimhen';
    const summary = 'Real Madrid have submitted a proposal to target Victor Osimhen.';

    const resolved = resolveTransferEntities(headline, summary, 'real-madrid');

    expect(resolved.playerName).toBe('Victor Osimhen');
    expect(resolved.destinationClub?.name).toBe('Real Madrid');
  });
});
