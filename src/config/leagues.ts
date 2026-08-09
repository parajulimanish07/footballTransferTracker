import { clubs } from './clubs';
import type { Club } from '@/types/club';

export interface League {
  id: string;
  name: string;
  slug: string;
  country: string;
  clubIds: string[];
}

export const leagues: League[] = [
  {
    id: 'premier-league',
    name: 'Premier League',
    slug: 'premier-league',
    country: 'England',
    clubIds: clubs.filter((c) => c.leagueId === 'premier-league').map((c) => c.id),
  },
  {
    id: 'la-liga',
    name: 'La Liga',
    slug: 'la-liga',
    country: 'Spain',
    clubIds: clubs.filter((c) => c.leagueId === 'la-liga').map((c) => c.id),
  },
  {
    id: 'serie-a',
    name: 'Serie A',
    slug: 'serie-a',
    country: 'Italy',
    clubIds: clubs.filter((c) => c.leagueId === 'serie-a').map((c) => c.id),
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    slug: 'bundesliga',
    country: 'Germany',
    clubIds: clubs.filter((c) => c.leagueId === 'bundesliga').map((c) => c.id),
  },
  {
    id: 'ligue-1',
    name: 'Ligue 1',
    slug: 'ligue-1',
    country: 'France',
    clubIds: clubs.filter((c) => c.leagueId === 'ligue-1').map((c) => c.id),
  },
  {
    id: 'super-lig',
    name: 'Süper Lig',
    slug: 'super-lig',
    country: 'Turkey',
    clubIds: clubs.filter((c) => c.leagueId === 'super-lig').map((c) => c.id),
  },
  {
    id: 'saudi-pro-league',
    name: 'Saudi Pro League',
    slug: 'saudi-pro-league',
    country: 'Saudi Arabia',
    clubIds: clubs.filter((c) => c.leagueId === 'saudi-pro-league').map((c) => c.id),
  },
  {
    id: 'primeira-liga',
    name: 'Primeira Liga',
    slug: 'primeira-liga',
    country: 'Portugal',
    clubIds: clubs.filter((c) => c.leagueId === 'primeira-liga').map((c) => c.id),
  },
];

export function getLeagueBySlug(slug: string): League | null {
  return leagues.find((league) => league.slug === slug) ?? null;
}

export function getLeagueById(id: string): League | null {
  return leagues.find((league) => league.id === id) ?? null;
}

export function getClubsForLeague(leagueId: string): Club[] {
  const league = getLeagueById(leagueId);
  if (!league) return [];
  const clubIdSet = new Set(league.clubIds);
  return clubs.filter((club) => clubIdSet.has(club.id));
}
