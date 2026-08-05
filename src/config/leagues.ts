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
    clubIds: ['liverpool', 'arsenal', 'manchester-united', 'chelsea', 'manchester-city', 'tottenham-hotspur', 'aston-villa'],
  },
  {
    id: 'la-liga',
    name: 'La Liga',
    slug: 'la-liga',
    country: 'Spain',
    clubIds: ['real-madrid', 'barcelona', 'atletico-madrid'],
  },
  {
    id: 'serie-a',
    name: 'Serie A',
    slug: 'serie-a',
    country: 'Italy',
    clubIds: ['inter', 'napoli'],
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    slug: 'bundesliga',
    country: 'Germany',
    clubIds: ['bayern-munich'],
  },
  {
    id: 'ligue-1',
    name: 'Ligue 1',
    slug: 'ligue-1',
    country: 'France',
    clubIds: ['psg'],
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
