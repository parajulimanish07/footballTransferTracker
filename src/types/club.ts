export type ClubLeague = 'Premier League' | 'La Liga' | 'Serie A' | 'Bundesliga' | 'Ligue 1';

export interface ClubSummary {
  id: string;
  name: string;
  slug: string;
  league: ClubLeague;
  crestUrl: string | null;
}

export interface Club extends ClubSummary {
  aliases: string[];
  country: string;
  city: string;
  websiteUrl: string | null;
  description: string;
}