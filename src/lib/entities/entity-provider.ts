import type { ExternalCompetition, ExternalTeam, ExternalPlayer } from './entity-types';
import { FootballDataProvider } from './football-data-provider';
import { MockFootballEntityProvider } from './mock-entity-provider';

export interface FootballEntityProvider {
  id: string;
  getCompetitions(): Promise<ExternalCompetition[]>;
  getTeamsByCompetition(competitionId: string): Promise<ExternalTeam[]>;
  getTeam(teamId: string): Promise<ExternalTeam | null>;
  getSquad(teamId: string): Promise<ExternalPlayer[]>;
  searchPlayer?(query: string): Promise<ExternalPlayer[]>;
}

export function getFootballEntityProvider(): FootballEntityProvider {
  const providerType = process.env.FOOTBALL_ENTITY_PROVIDER || 'mock';
  switch (providerType.toLowerCase()) {
    case 'football-data':
      return new FootballDataProvider();
    case 'mock':
    default:
      return new MockFootballEntityProvider();
  }
}
