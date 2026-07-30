import { describe, expect, it } from 'vitest';
import { matchClubs } from '../match-clubs';

describe('matchClubs', () => {
  it('matches club aliases', () => {
    const clubs = matchClubs('Man Utd are close to a deal');
    expect(clubs.some((club) => club.id === 'manchester-united')).toBe(true);
  });

  it('avoids ambiguous United matches without context', () => {
    const clubs = matchClubs('United consider move for striker');
    expect(clubs.some((club) => club.id === 'manchester-united')).toBe(false);
  });
});