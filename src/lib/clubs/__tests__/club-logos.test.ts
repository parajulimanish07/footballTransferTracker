import { describe, it, expect } from 'vitest';
import { clubs, getClubById, FALLBACK_CLUB_LOGO } from '@/config/clubs';

describe('Club Logo Configuration & Fallback Unit Tests', () => {
  it('1. Every supported club has a valid logo configuration with dimensions', () => {
    expect(clubs.length).toBeGreaterThan(0);
    clubs.forEach((club) => {
      expect(club.logo).toBeDefined();
      expect(club.logo.src).toBeDefined();
      expect(club.logo.src).toContain('/clubs/');
      expect(club.logo.width).toBe(40);
      expect(club.logo.height).toBe(40);
      expect(club.shortName).toBeDefined();
      expect(club.leagueId).toBeDefined();
    });
  });

  it('2. Fallback logo configuration is defined with valid dimensions', () => {
    expect(FALLBACK_CLUB_LOGO).toBeDefined();
    expect(FALLBACK_CLUB_LOGO.src).toBe('/clubs/fallback-club.svg');
    expect(FALLBACK_CLUB_LOGO.width).toBe(40);
    expect(FALLBACK_CLUB_LOGO.height).toBe(40);
  });

  it('3. Lookup for invalid or missing club returns null and fallback logo applies', () => {
    const invalidClub = getClubById('fake-nonexistent-club');
    expect(invalidClub).toBeNull();
    const logo = invalidClub?.logo || FALLBACK_CLUB_LOGO;
    expect(logo.src).toBe('/clubs/fallback-club.svg');
  });

  it('4. Popular clubs have valid crest URLs mapped', () => {
    const liverpool = getClubById('liverpool');
    expect(liverpool?.logo.src).toBe('/clubs/liverpool.png');

    const realMadrid = getClubById('real-madrid');
    expect(realMadrid?.logo.src).toBe('/clubs/real-madrid.png');
  });

  it('5. Every club logo alt text contains descriptive club name', () => {
    clubs.forEach((club) => {
      const alt = club.logo.alt.toLowerCase();
      const match = alt.includes(club.name.toLowerCase()) || alt.includes(club.shortName.toLowerCase());
      expect(match).toBe(true);
    });
  });
});
