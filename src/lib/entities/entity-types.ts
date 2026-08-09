export type EntitySource = 'article' | 'catalogue' | 'reviewed_alias' | 'legacy_fallback' | 'unknown';

export interface ExternalCompetition {
  externalId: string;
  name: string;
  country: string | null;
  code: string | null;
}

export interface ExternalTeam {
  externalId: string;
  name: string;
  shortName: string | null;
  tla: string | null;
  country: string | null;
  crestUrl: string | null;
  competitionExternalId: string | null;
}

export interface ExternalPlayer {
  externalId: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  position: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  currentTeamExternalId: string | null;
}

export interface FootballLeagueEntity {
  id: string;
  externalProvider: string;
  externalId: string;
  name: string;
  slug: string;
  country: string | null;
  enabled: boolean;
}

export interface FootballClubEntity {
  id: string;
  externalProvider: string;
  externalId: string;
  name: string;
  slug: string;
  shortName: string | null;
  leagueId: string;
  logoPath: string | null;
  aliases: string[];
  enabled: boolean;
  updatedAt: string;
}

export interface FootballPlayerEntity {
  id: string;
  externalProvider: string;
  externalId: string;
  name: string;
  normalizedName: string;
  aliases: string[];
  currentClubId: string | null;
  position: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  updatedAt: string;
}

export interface EntityFreshness {
  lastSyncedAt: string;
  staleAfterHours: number;
}

export interface EntitySyncRun {
  id: string;
  provider: string;
  syncType: 'leagues' | 'teams' | 'squad';
  targetId: string | null;
  startedAt: string;
  completedAt: string | null;
  status: 'running' | 'completed' | 'partial' | 'failed';
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  errorMessage?: string | null;
}
