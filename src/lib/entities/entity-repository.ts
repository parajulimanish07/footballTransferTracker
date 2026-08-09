import fs from 'fs';
import path from 'path';
import { clubs as seedClubs } from '@/config/clubs';
import { leagues as seedLeagues } from '@/config/leagues';
import type {
  FootballLeagueEntity,
  FootballClubEntity,
  FootballPlayerEntity,
} from './entity-types';

export interface FootballEntityRepository {
  getLeagueById(id: string): Promise<FootballLeagueEntity | null>;
  getClubById(id: string): Promise<FootballClubEntity | null>;
  getClubBySlug(slug: string): Promise<FootballClubEntity | null>;
  findClubByAlias(name: string): Promise<FootballClubEntity | null>;
  getPlayerById(id: string): Promise<FootballPlayerEntity | null>;
  findPlayersByName(query: string): Promise<FootballPlayerEntity[]>;
  findPlayerByExactOrAlias(name: string): Promise<FootballPlayerEntity | null>;
  upsertLeague(league: FootballLeagueEntity): Promise<void>;
  upsertClub(club: FootballClubEntity): Promise<void>;
  upsertPlayer(player: FootballPlayerEntity): Promise<void>;
  getAllLeagues(): Promise<FootballLeagueEntity[]>;
  getAllClubs(): Promise<FootballClubEntity[]>;
  getAllPlayers(): Promise<FootballPlayerEntity[]>;
}

export class PersistentFootballEntityRepository implements FootballEntityRepository {
  private leagues = new Map<string, FootballLeagueEntity>();
  private clubs = new Map<string, FootballClubEntity>();
  private players = new Map<string, FootballPlayerEntity>();
  private dataFilePath: string;

  constructor() {
    this.dataFilePath = path.join(process.cwd(), '.data', 'football-entities.json');
    this.initializeStore();
  }

  private initializeStore(): void {
    // 1. Seed default leagues
    seedLeagues.forEach((l) => {
      this.leagues.set(l.id, {
        id: l.id,
        externalProvider: 'config',
        externalId: l.id,
        name: l.name,
        slug: l.slug,
        country: l.country,
        enabled: true,
      });
    });

    // 2. Seed default clubs
    seedClubs.forEach((c) => {
      this.clubs.set(c.id, {
        id: c.id,
        externalProvider: 'config',
        externalId: c.id,
        name: c.name,
        slug: c.slug,
        shortName: c.shortName || c.name,
        leagueId: c.leagueId,
        logoPath: c.crestUrl || `/clubs/${c.id}.png`,
        aliases: Array.from(new Set([c.name, c.shortName, c.slug, ...(c.aliases || [])].filter(Boolean) as string[])),
        enabled: true,
        updatedAt: new Date().toISOString(),
      });
    });

    // 3. Load persistent JSON cache if exists
    if (fs.existsSync(this.dataFilePath)) {
      try {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.leagues)) {
          parsed.leagues.forEach((l: FootballLeagueEntity) => this.leagues.set(l.id, l));
        }
        if (Array.isArray(parsed.clubs)) {
          parsed.clubs.forEach((c: FootballClubEntity) => this.clubs.set(c.id, c));
        }
        if (Array.isArray(parsed.players)) {
          parsed.players.forEach((p: FootballPlayerEntity) => this.players.set(p.id, p));
        }
      } catch {
        // Fall back to seeded memory
      }
    }
  }

  private saveToDisk(): void {
    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = {
        leagues: Array.from(this.leagues.values()),
        clubs: Array.from(this.clubs.values()),
        players: Array.from(this.players.values()),
      };
      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // Ignored in restricted environments
    }
  }

  async getLeagueById(id: string): Promise<FootballLeagueEntity | null> {
    return this.leagues.get(id) || null;
  }

  async getClubById(id: string): Promise<FootballClubEntity | null> {
    return this.clubs.get(id) || null;
  }

  async getClubBySlug(slug: string): Promise<FootballClubEntity | null> {
    return Array.from(this.clubs.values()).find((c) => c.slug === slug) || null;
  }

  async findClubByAlias(name: string): Promise<FootballClubEntity | null> {
    const q = name.toLowerCase().trim();
    if (!q) return null;

    // Direct exact name or slug match
    const direct = Array.from(this.clubs.values()).find(
      (c) => c.name.toLowerCase() === q || c.slug === q || c.shortName?.toLowerCase() === q
    );
    if (direct) return direct;

    // Alias list match
    return (
      Array.from(this.clubs.values()).find((c) =>
        c.aliases.some((alias) => alias.toLowerCase() === q)
      ) || null
    );
  }

  async getPlayerById(id: string): Promise<FootballPlayerEntity | null> {
    return this.players.get(id) || null;
  }

  async findPlayersByName(query: string): Promise<FootballPlayerEntity[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return Array.from(this.players.values()).filter(
      (p) =>
        p.normalizedName.includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.aliases.some((a) => a.toLowerCase().includes(q))
    );
  }

  findPlayerByExactOrAliasSync(name: string): FootballPlayerEntity | null {
    const q = name.toLowerCase().trim();
    if (!q) return null;

    const matches = Array.from(this.players.values()).filter(
      (p) =>
        p.normalizedName === q ||
        p.name.toLowerCase() === q ||
        p.aliases.some((a) => a.toLowerCase() === q)
    );

    return matches.length > 0 ? matches[0] : null;
  }

  async findPlayerByExactOrAlias(name: string): Promise<FootballPlayerEntity | null> {
    return this.findPlayerByExactOrAliasSync(name);
  }

  async upsertLeague(league: FootballLeagueEntity): Promise<void> {
    this.leagues.set(league.id, league);
    this.saveToDisk();
  }

  async upsertClub(club: FootballClubEntity): Promise<void> {
    const existing = this.clubs.get(club.id);
    if (existing) {
      const mergedAliases = Array.from(new Set([...existing.aliases, ...club.aliases]));
      this.clubs.set(club.id, { ...existing, ...club, aliases: mergedAliases });
    } else {
      this.clubs.set(club.id, club);
    }
    this.saveToDisk();
  }

  async upsertPlayer(player: FootballPlayerEntity): Promise<void> {
    const existing = this.players.get(player.id);
    if (existing) {
      const mergedAliases = Array.from(new Set([...existing.aliases, ...player.aliases]));
      this.players.set(player.id, { ...existing, ...player, aliases: mergedAliases });
    } else {
      this.players.set(player.id, player);
    }
    this.saveToDisk();
  }

  async getAllLeagues(): Promise<FootballLeagueEntity[]> {
    return Array.from(this.leagues.values());
  }

  async getAllClubs(): Promise<FootballClubEntity[]> {
    return Array.from(this.clubs.values());
  }

  async getAllPlayers(): Promise<FootballPlayerEntity[]> {
    return Array.from(this.players.values());
  }
}

export const footballEntityRepository = new PersistentFootballEntityRepository();
