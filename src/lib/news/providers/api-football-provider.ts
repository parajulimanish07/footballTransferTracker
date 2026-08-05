import { z } from 'zod';
import type { NewsProvider, RawNewsArticle, TransferNewsQuery } from './provider-types';

const ApiFootballTransferSchema = z.object({
  player: z.object({
    id: z.number(),
    name: z.string(),
  }),
  update: z.string().optional(),
  transfers: z.array(
    z.object({
      date: z.string(),
      type: z.string().nullable().optional(),
      teams: z.object({
        in: z.object({ id: z.number(), name: z.string(), logo: z.string().optional() }),
        out: z.object({ id: z.number(), name: z.string(), logo: z.string().optional() }),
      }),
    })
  ),
});

const ApiFootballResponseSchema = z.object({
  response: z.array(ApiFootballTransferSchema),
});

// Popular API-Football team ID mappings for 1-tap query acceleration
const TEAM_ID_MAP: Record<string, number> = {
  'manchester-city': 50,
  liverpool: 40,
  arsenal: 42,
  'real-madrid': 541,
  'manchester-united': 33,
  chelsea: 49,
  barcelona: 529,
  'bayern-munich': 157,
  inter: 505,
  psg: 85,
};

export const apiFootballProvider: NewsProvider = {
  id: 'api-football',
  get enabled() {
    return Boolean(process.env.API_FOOTBALL_KEY);
  },

  async getTransferNews(options: TransferNewsQuery): Promise<RawNewsArticle[]> {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) return [];

    const targetTeamId = options.clubIds?.[0] ? TEAM_ID_MAP[options.clubIds[0]] || 42 : 42;

    const url = new URL('https://v3.football.api-sports.io/transfers');
    url.searchParams.set('team', String(targetTeamId));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'x-apisports-key': apiKey,
          'x-rapidapi-key': apiKey,
          Accept: 'application/json',
        },
      });

      if (!response.ok) throw new Error(`API-Football returned status ${response.status}`);

      const json = await response.json();
      const parsed = ApiFootballResponseSchema.safeParse(json);
      if (!parsed.success || !parsed.data.response.length) return [];

      const rawArticles: RawNewsArticle[] = [];

      parsed.data.response.forEach((item) => {
        item.transfers.forEach((tr) => {
          const headline = `${item.player.name} transfer confirmed: ${tr.teams.out.name} ➔ ${tr.teams.in.name}`;
          const description = `Official transfer record from API-Football database: ${item.player.name} moves from ${tr.teams.out.name} to ${tr.teams.in.name} (${tr.type || 'Undisclosed Fee'}). Date: ${tr.date}.`;

          rawArticles.push({
            externalId: `api-football-${item.player.id}-${tr.teams.out.id}-${tr.teams.in.id}-${tr.date}`,
            headline,
            description,
            bodyText: null,
            sourceName: 'API-Football Official Database',
            sourceDomain: 'api-sports.io',
            sourceUrl: `https://api-sports.io/football/transfers/${item.player.id}`,
            journalistName: 'Official League Registrar',
            publishedAt: tr.date ? new Date(tr.date).toISOString() : new Date().toISOString(),
            imageUrl: tr.teams.in.logo || null,
            relatedClubHints: [tr.teams.in.name, tr.teams.out.name],
            provider: 'api-football',
          });
        });
      });

      return rawArticles.slice(0, options.limit ?? 20);
    } catch {
      return [];
    } finally {
      clearTimeout(timeout);
    }
  },
};
