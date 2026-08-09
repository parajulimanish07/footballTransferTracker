export type ClubLeague = 'Premier League' | 'La Liga' | 'Serie A' | 'Bundesliga' | 'Ligue 1' | 'Süper Lig' | 'Saudi Pro League' | 'Primeira Liga';

export interface ClubLogoConfig {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ClubSummary {
  id: string;
  name: string;
  slug: string;
  league: ClubLeague;
  crestUrl: string | null;
  logo?: ClubLogoConfig;
}

export interface Club extends ClubSummary {
  shortName: string;
  leagueId: string;
  logo: ClubLogoConfig;
  aliases: string[];
  country: string;
  city: string;
  websiteUrl: string | null;
  description: string;
}