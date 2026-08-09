import type { FootballEntityProvider } from './entity-provider';
import type { ExternalCompetition, ExternalTeam, ExternalPlayer } from './entity-types';

export class MockFootballEntityProvider implements FootballEntityProvider {
  id = 'mock-entity-provider';

  async getCompetitions(): Promise<ExternalCompetition[]> {
    return [
      { externalId: 'PL', name: 'Premier League', country: 'England', code: 'PL' },
      { externalId: 'PD', name: 'La Liga', country: 'Spain', code: 'PD' },
      { externalId: 'SA', name: 'Serie A', country: 'Italy', code: 'SA' },
      { externalId: 'BL1', name: 'Bundesliga', country: 'Germany', code: 'BL1' },
      { externalId: 'FL1', name: 'Ligue 1', country: 'France', code: 'FL1' },
      { externalId: 'PPL', name: 'Primeira Liga', country: 'Portugal', code: 'PPL' },
      { externalId: 'TSL', name: 'Süper Lig', country: 'Turkey', code: 'TSL' },
      { externalId: 'SPL', name: 'Saudi Pro League', country: 'Saudi Arabia', code: 'SPL' },
    ];
  }

  async getTeamsByCompetition(competitionId: string): Promise<ExternalTeam[]> {
    const teams: Record<string, ExternalTeam[]> = {
      PL: [
        { externalId: '65', name: 'Manchester City FC', shortName: 'Man City', tla: 'MCI', country: 'England', crestUrl: '/clubs/manchester-city.png', competitionExternalId: 'PL' },
        { externalId: '64', name: 'Liverpool FC', shortName: 'Liverpool', tla: 'LIV', country: 'England', crestUrl: '/clubs/liverpool.png', competitionExternalId: 'PL' },
        { externalId: '66', name: 'Manchester United FC', shortName: 'Man United', tla: 'MUN', country: 'England', crestUrl: '/clubs/manchester-united.png', competitionExternalId: 'PL' },
        { externalId: '57', name: 'Arsenal FC', shortName: 'Arsenal', tla: 'ARS', country: 'England', crestUrl: '/clubs/arsenal.png', competitionExternalId: 'PL' },
        { externalId: '61', name: 'Chelsea FC', shortName: 'Chelsea', tla: 'CHE', country: 'England', crestUrl: '/clubs/chelsea.png', competitionExternalId: 'PL' },
        { externalId: '73', name: 'Tottenham Hotspur FC', shortName: 'Spurs', tla: 'TOT', country: 'England', crestUrl: '/clubs/tottenham-hotspur.png', competitionExternalId: 'PL' },
        { externalId: '341', name: 'Leeds United FC', shortName: 'Leeds', tla: 'LEE', country: 'England', crestUrl: '/clubs/leeds-united.png', competitionExternalId: 'PL' },
      ],
      PD: [
        { externalId: '86', name: 'Real Madrid CF', shortName: 'Real Madrid', tla: 'RMA', country: 'Spain', crestUrl: '/clubs/real-madrid.png', competitionExternalId: 'PD' },
        { externalId: '81', name: 'FC Barcelona', shortName: 'Barcelona', tla: 'BAR', country: 'Spain', crestUrl: '/clubs/barcelona.png', competitionExternalId: 'PD' },
        { externalId: '78', name: 'Club Atlético de Madrid', shortName: 'Atlético', tla: 'ATM', country: 'Spain', crestUrl: '/clubs/atletico-madrid.png', competitionExternalId: 'PD' },
      ],
      SA: [
        { externalId: '109', name: 'Juventus FC', shortName: 'Juventus', tla: 'JUV', country: 'Italy', crestUrl: '/clubs/juventus.png', competitionExternalId: 'SA' },
        { externalId: '108', name: 'FC Internazionale Milano', shortName: 'Inter', tla: 'INT', country: 'Italy', crestUrl: '/clubs/inter.png', competitionExternalId: 'SA' },
        { externalId: '113', name: 'SSC Napoli', shortName: 'Napoli', tla: 'NAP', country: 'Italy', crestUrl: '/clubs/napoli.png', competitionExternalId: 'SA' },
      ],
    };

    return teams[competitionId.toUpperCase()] || [];
  }

  async getTeam(teamId: string): Promise<ExternalTeam | null> {
    const all = [
      ...(await this.getTeamsByCompetition('PL')),
      ...(await this.getTeamsByCompetition('PD')),
      ...(await this.getTeamsByCompetition('SA')),
    ];
    return all.find((t) => t.externalId === teamId) || null;
  }

  async getSquad(teamId: string): Promise<ExternalPlayer[]> {
    const squads: Record<string, ExternalPlayer[]> = {
      '64': [
        { externalId: 'p-101', name: 'Mohamed Salah', firstName: 'Mohamed', lastName: 'Salah', position: 'Offence', nationality: 'Egypt', dateOfBirth: '1992-06-15', currentTeamExternalId: '64' },
        { externalId: 'p-102', name: 'Cody Gakpo', firstName: 'Cody', lastName: 'Gakpo', position: 'Offence', nationality: 'Netherlands', dateOfBirth: '1999-05-07', currentTeamExternalId: '64' },
        { externalId: 'p-103', name: 'Luis Díaz', firstName: 'Luis', lastName: 'Díaz', position: 'Offence', nationality: 'Colombia', dateOfBirth: '1997-01-13', currentTeamExternalId: '64' },
      ],
      '86': [
        { externalId: 'p-201', name: 'Kylian Mbappé', firstName: 'Kylian', lastName: 'Mbappé', position: 'Offence', nationality: 'France', dateOfBirth: '1998-12-20', currentTeamExternalId: '86' },
        { externalId: 'p-202', name: 'Vinícius Júnior', firstName: 'Vinícius', lastName: 'Júnior', position: 'Offence', nationality: 'Brazil', dateOfBirth: '2000-07-12', currentTeamExternalId: '86' },
        { externalId: 'p-203', name: 'Jude Bellingham', firstName: 'Jude', lastName: 'Bellingham', position: 'Midfield', nationality: 'England', dateOfBirth: '2003-06-29', currentTeamExternalId: '86' },
      ],
      '65': [
        { externalId: 'p-301', name: 'Erling Haaland', firstName: 'Erling', lastName: 'Haaland', position: 'Offence', nationality: 'Norway', dateOfBirth: '2000-07-21', currentTeamExternalId: '65' },
        { externalId: 'p-302', name: 'Rodri', firstName: 'Rodrigo', lastName: 'Hernández', position: 'Midfield', nationality: 'Spain', dateOfBirth: '1996-06-22', currentTeamExternalId: '65' },
        { externalId: 'p-303', name: 'James Trafford', firstName: 'James', lastName: 'Trafford', position: 'Goalkeeper', nationality: 'England', dateOfBirth: '2002-10-10', currentTeamExternalId: '65' },
      ],
    };

    return squads[teamId] || [];
  }

  async searchPlayer(query: string): Promise<ExternalPlayer[]> {
    const q = query.toLowerCase();
    const allPlayers = [
      ...(await this.getSquad('64')),
      ...(await this.getSquad('86')),
      ...(await this.getSquad('65')),
    ];
    return allPlayers.filter((p) => p.name.toLowerCase().includes(q));
  }
}
