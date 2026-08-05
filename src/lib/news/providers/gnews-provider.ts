import { z } from 'zod';
import type { NewsProvider, RawNewsArticle, TransferNewsQuery } from './provider-types';

const GNewsArticleSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  url: z.string().url(),
  publishedAt: z.string(),
  source: z.object({ name: z.string(), url: z.string().optional() }),
  image: z.string().nullable().optional(),
});

const GNewsResponseSchema = z.object({
  totalArticles: z.number(),
  articles: z.array(GNewsArticleSchema),
});

export const gnewsProvider: NewsProvider = {
  id: 'gnews',
  get enabled() {
    return Boolean(process.env.GNEWS_API_KEY);
  },

  async getTransferNews(options: TransferNewsQuery): Promise<RawNewsArticle[]> {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) return [];

    const query = 'football transfer OR signing OR bid OR offer';
    const url = new URL('https://gnews.io/api/v4/search');
    url.searchParams.set('q', query);
    url.searchParams.set('lang', 'en');
    url.searchParams.set('max', String(Math.min(options.limit ?? 20, 25)));
    url.searchParams.set('apikey', apiKey);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(url.toString(), { signal: controller.signal });
      if (!response.ok) throw new Error(`GNews status ${response.status}`);

      const json = await response.json();
      const parsed = GNewsResponseSchema.safeParse(json);
      if (!parsed.success) return [];

      return parsed.data.articles.map((art): RawNewsArticle => {
        let domain = 'gnews.io';
        try {
          domain = new URL(art.url).hostname.replace(/^www\./, '').toLowerCase();
        } catch {
          // fallback
        }

        return {
          externalId: `gnews-${Buffer.from(art.url).toString('base64url')}`,
          headline: art.title,
          description: art.description || null,
          bodyText: null,
          sourceName: art.source.name || domain,
          sourceDomain: domain,
          sourceUrl: art.url,
          journalistName: null, // GNews does not provide author; must verify via source
          publishedAt: art.publishedAt,
          imageUrl: art.image || null,
          relatedClubHints: [],
          provider: 'gnews',
        };
      });
    } catch {
      return [];
    } finally {
      clearTimeout(timeout);
    }
  },
};