import { describe, it, expect } from 'vitest';
import { resolveTransferEntities } from '../resolve-transfer-entities';

describe('Sentence-Level Transfer Entity Resolution', () => {
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
});
