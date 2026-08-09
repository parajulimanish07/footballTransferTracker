import { getFootballEntityProvider } from './entity-provider';
import { footballEntityRepository } from './entity-repository';
import type {
  EntitySyncRun,
  EntityFreshness,
  FootballClubEntity,
  FootballPlayerEntity,
} from './entity-types';
import { leagues as supportedLeaguesConfig } from '@/config/leagues';

const syncRunHistory: EntitySyncRun[] = [];
let lastSyncTimestamp = new Date().toISOString();

export function getEntityFreshness(): EntityFreshness {
  return {
    lastSyncedAt: lastSyncTimestamp,
    staleAfterHours: 72, // 3 days outside window, 24h during window
  };
}

export function getLatestSyncRuns(): EntitySyncRun[] {
  return syncRunHistory.slice(0, 10);
}

export async function syncSupportedLeagues(): Promise<EntitySyncRun> {
  const provider = getFootballEntityProvider();
  const runId = `sync-leagues-${Date.now()}`;
  const run: EntitySyncRun = {
    id: runId,
    provider: provider.id,
    syncType: 'leagues',
    targetId: 'all-supported',
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: 'running',
    createdCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    errorCount: 0,
  };

  syncRunHistory.unshift(run);

  try {
    const extCompetitions = await provider.getCompetitions();

    for (const league of supportedLeaguesConfig) {
      const match = extCompetitions.find(
        (c) =>
          c.code?.toLowerCase() === league.id.toLowerCase() ||
          c.name.toLowerCase().includes(league.name.toLowerCase()) ||
          c.externalId === league.id
      );

      if (match) {
        await footballEntityRepository.upsertLeague({
          id: league.id,
          externalProvider: provider.id,
          externalId: match.externalId,
          name: league.name,
          slug: league.slug,
          country: league.country,
          enabled: true,
        });
        run.updatedCount++;
      } else {
        run.skippedCount++;
      }
    }

    run.status = 'completed';
    run.completedAt = new Date().toISOString();
    lastSyncTimestamp = run.completedAt;
  } catch (err: any) {
    run.status = 'failed';
    run.errorCount++;
    run.errorMessage = err.message || 'Failed to sync competitions';
    run.completedAt = new Date().toISOString();
  }

  return run;
}

export async function syncLeagueTeams(leagueId: string): Promise<EntitySyncRun> {
  const provider = getFootballEntityProvider();
  const league = supportedLeaguesConfig.find((l) => l.id === leagueId);

  const runId = `sync-teams-${leagueId}-${Date.now()}`;
  const run: EntitySyncRun = {
    id: runId,
    provider: provider.id,
    syncType: 'teams',
    targetId: leagueId,
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: 'running',
    createdCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    errorCount: 0,
  };

  syncRunHistory.unshift(run);

  if (!league) {
    run.status = 'failed';
    run.errorMessage = `League ID ${leagueId} is not supported`;
    run.completedAt = new Date().toISOString();
    return run;
  }

  try {
    const extTeams = await provider.getTeamsByCompetition(leagueId);

    for (const team of extTeams) {
      const canonicalSlug = team.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const internalId = canonicalSlug || `team-${team.externalId}`;

      const entity: FootballClubEntity = {
        id: internalId,
        externalProvider: provider.id,
        externalId: team.externalId,
        name: team.name,
        slug: canonicalSlug,
        shortName: team.shortName,
        leagueId,
        logoPath: team.crestUrl || `/clubs/${internalId}.png`,
        aliases: Array.from(new Set([team.name, team.shortName, team.tla].filter(Boolean) as string[])),
        enabled: true,
        updatedAt: new Date().toISOString(),
      };

      await footballEntityRepository.upsertClub(entity);
      run.updatedCount++;
    }

    run.status = 'completed';
    run.completedAt = new Date().toISOString();
    lastSyncTimestamp = run.completedAt;
  } catch (err: any) {
    run.status = 'failed';
    run.errorCount++;
    run.errorMessage = err.message || `Failed to sync teams for ${leagueId}`;
    run.completedAt = new Date().toISOString();
  }

  return run;
}

export async function syncTeamSquad(clubId: string): Promise<EntitySyncRun> {
  const provider = getFootballEntityProvider();
  const club = await footballEntityRepository.getClubById(clubId);

  const runId = `sync-squad-${clubId}-${Date.now()}`;
  const run: EntitySyncRun = {
    id: runId,
    provider: provider.id,
    syncType: 'squad',
    targetId: clubId,
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: 'running',
    createdCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    errorCount: 0,
  };

  syncRunHistory.unshift(run);

  if (!club) {
    run.status = 'failed';
    run.errorMessage = `Club ID ${clubId} not found in entity repository`;
    run.completedAt = new Date().toISOString();
    return run;
  }

  try {
    const extPlayers = await provider.getSquad(club.externalId || club.id);

    for (const player of extPlayers) {
      const normName = player.name.toLowerCase().trim();
      const internalId = `p-${player.externalId}`;

      const aliases = Array.from(
        new Set([player.name, `${player.firstName || ''} ${player.lastName || ''}`.trim()].filter(Boolean))
      );

      const entity: FootballPlayerEntity = {
        id: internalId,
        externalProvider: provider.id,
        externalId: player.externalId,
        name: player.name,
        normalizedName: normName,
        aliases,
        currentClubId: club.id,
        position: player.position,
        nationality: player.nationality,
        dateOfBirth: player.dateOfBirth,
        updatedAt: new Date().toISOString(),
      };

      await footballEntityRepository.upsertPlayer(entity);
      run.updatedCount++;
    }

    run.status = 'completed';
    run.completedAt = new Date().toISOString();
    lastSyncTimestamp = run.completedAt;
  } catch (err: any) {
    run.status = 'failed';
    run.errorCount++;
    run.errorMessage = err.message || `Failed to sync squad for ${clubId}`;
    run.completedAt = new Date().toISOString();
  }

  return run;
}
