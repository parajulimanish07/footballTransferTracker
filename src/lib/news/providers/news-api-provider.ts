import { z } from 'zod';
import type { NewsProvider, RawNewsArticle, TransferNewsQuery } from './provider-types';

const NewsApiArticleSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  url: z.string().url(),
  source: z.object({ name: z.string().min(1).optional().default('Unknown') }).optional(),
  author: z.string().nullable().optional(),
  publishedAt: z.string().datetime().optional(),
  urlToImage: z.string().url().nullable().optional(),
});

const NewsApiResponseSchema = z.object({
  status: z.literal('ok'),
  totalResults: z.number().int().nonnegative(),
  articles: z.array(NewsApiArticleSchema),
});

export const newsApiProvider: NewsProvider = {
  id: 'newsapi',
  get enabled() {
    return Boolean(process.env.NEWS_API_KEY);
  },

  async getTransferNews(options: TransferNewsQuery): Promise<RawNewsArticle[]> {
    if (!process.env.NEWS_API_KEY) return [];

    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.set('q', 'football transfer OR signing OR bid OR offer');
    url.searchParams.set('language', 'en');
    url.searchParams.set('sortBy', 'publishedAt');
    url.searchParams.set('pageSize', String(Math.min(options.limit ?? 20, 50)));
    url.searchParams.set('apiKey', process.env.NEWS_API_KEY);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url.toString(), { signal: controller.signal, headers: { Accept: 'application/json' } });
      if (!response.ok) return [];

      const json = await response.json();
      const parsed = NewsApiResponseSchema.safeParse(json);
      if (!parsed.success) return [];

      return parsed.data.articles.map((art): RawNewsArticle => {
        let domain = 'newsapi.org';
        try {
          domain = new URL(art.url).hostname.replace(/^www\./, '').toLowerCase();
        } catch {
          // fallback
        }

        return {
          externalId: `newsapi-${domain}-${Buffer.from(art.url).toString('base64url')}`,
          headline: art.title,
          description: art.description || null,
          bodyText: null,
          sourceName: art.source?.name || domain,
          sourceDomain: domain,
          sourceUrl: art.url,
          journalistName: art.author?.trim() || null,
          publishedAt: art.publishedAt ?? new Date().toISOString(),
          imageUrl: art.urlToImage || null,
          relatedClubHints: [],
          provider: 'newsapi',
        };
      });
    } catch {
      return [];
    } finally {
      clearTimeout(timeout);
    }
  },
};