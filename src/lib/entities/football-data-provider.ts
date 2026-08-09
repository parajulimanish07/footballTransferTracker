import type { FootballEntityProvider } from './entity-provider';
import type { ExternalCompetition, ExternalTeam, ExternalPlayer } from './entity-types';
import { MockFootballEntityProvider } from './mock-entity-provider';

export class FootballDataProvider implements FootballEntityProvider {
  id = 'football-data';
  private apiKey: string;
  private baseUrl: string;
  private mockFallback: MockFootballEntityProvider;

  constructor() {
    this.apiKey = process.env.FOOTBALL_DATA_API_KEY || '';
    this.baseUrl = 'https://api.football-data.org/v4';
    this.mockFallback = new MockFootballEntityProvider();
  }

  private get headers(): Record<string, string> {
    return {
      'X-Auth-Token': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async getCompetitions(): Promise<ExternalCompetition[]> {
    if (!this.apiKey) {
      return this.mockFallback.getCompetitions();
    }

    try {
      const response = await fetch(`${this.baseUrl}/competitions`, {
        headers: this.headers,
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) {
        return this.mockFallback.getCompetitions();
      }

      const data = await response.json();
      const rawList: any[] = data.competitions || [];

      return rawList.map((comp) => ({
        externalId: String(comp.code || comp.id),
        name: comp.name,
        country: comp.area?.name || null,
        code: comp.code || null,
      }));
    } catch {
      return this.mockFallback.getCompetitions();
    }
  }

  async getTeamsByCompetition(competitionId: string): Promise<ExternalTeam[]> {
    if (!this.apiKey) {
      return this.mockFallback.getTeamsByCompetition(competitionId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/competitions/${encodeURIComponent(competitionId)}/teams`, {
        headers: this.headers,
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) {
        return this.mockFallback.getTeamsByCompetition(competitionId);
      }

      const data = await response.json();
      const rawTeams: any[] = data.teams || [];

      return rawTeams.map((team) => ({
        externalId: String(team.id),
        name: team.name,
        shortName: team.shortName || team.name,
        tla: team.tla || null,
        country: team.area?.name || null,
        crestUrl: team.crest || null,
        competitionExternalId: competitionId,
      }));
    } catch {
      return this.mockFallback.getTeamsByCompetition(competitionId);
    }
  }

  async getTeam(teamId: string): Promise<ExternalTeam | null> {
    if (!this.apiKey) {
      return this.mockFallback.getTeam(teamId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/teams/${encodeURIComponent(teamId)}`, {
        headers: this.headers,
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) {
        return this.mockFallback.getTeam(teamId);
      }

      const team = await response.json();
      return {
        externalId: String(team.id),
        name: team.name,
        shortName: team.shortName || team.name,
        tla: team.tla || null,
        country: team.area?.name || null,
        crestUrl: team.crest || null,
        competitionExternalId: team.runningCompetitions?.[0]?.code || null,
      };
    } catch {
      return this.mockFallback.getTeam(teamId);
    }
  }

  async getSquad(teamId: string): Promise<ExternalPlayer[]> {
    if (!this.apiKey) {
      return this.mockFallback.getSquad(teamId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/teams/${encodeURIComponent(teamId)}`, {
        headers: this.headers,
        next: { revalidate: 43200 },
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) {
        return this.mockFallback.getSquad(teamId);
      }

      const data = await response.json();
      const squad: any[] = data.squad || [];

      return squad.map((p) => ({
        externalId: String(p.id),
        name: p.name,
        firstName: p.firstName || null,
        lastName: p.lastName || null,
        position: p.position || null,
        nationality: p.nationality || null,
        dateOfBirth: p.dateOfBirth || null,
        currentTeamExternalId: teamId,
      }));
    } catch {
      return this.mockFallback.getSquad(teamId);
    }
  }

  async searchPlayer(query: string): Promise<ExternalPlayer[]> {
    return this.mockFallback.searchPlayer(query);
  }
}
