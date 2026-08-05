import { z } from 'zod';
import type { NewsProvider, RawNewsArticle, TransferNewsQuery } from './provider-types';

const GuardianArticleSchema = z.object({
  id: z.string(),
  webTitle: z.string(),
  webUrl: z.string().url(),
  webPublicationDate: z.string(),
  fields: z
    .object({
      headline: z.string().optional(),
      trailText: z.string().optional(),
      byline: z.string().optional(),
      bodyText: z.string().optional(),
      thumbnail: z.string().optional(),
    })
    .optional(),
});

const GuardianResponseSchema = z.object({
  response: z.object({
    status: z.literal('ok'),
    total: z.number(),
    results: z.array(GuardianArticleSchema),
  }),
});

export const guardianProvider: NewsProvider = {
  id: 'guardian',
  get enabled() {
    return Boolean(process.env.GUARDIAN_API_KEY);
  },

  async getTransferNews(options: TransferNewsQuery): Promise<RawNewsArticle[]> {
    const apiKey = process.env.GUARDIAN_API_KEY;
    if (!apiKey) return [];

    const keywords = 'transfer OR signing OR bid OR offer OR agreement OR talks OR negotiations OR loan OR departure OR medical OR "personal terms"';
    const url = new URL('https://content.guardianapis.com/search');
    url.searchParams.set('api-key', apiKey);
    url.searchParams.set('section', 'football');
    url.searchParams.set('q', keywords);
    url.searchParams.set('show-fields', 'headline,trailText,byline,bodyText,thumbnail');
    url.searchParams.set('page-size', String(Math.min(options.limit ?? 20, 50)));
    url.searchParams.set('order-by', 'newest');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    try {
      const response = await fetch(url.toString(), { signal: controller.signal, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Guardian API returned status ${response.status}`);

      const json = await response.json();
      const parsed = GuardianResponseSchema.safeParse(json);
      if (!parsed.success) return [];

      return parsed.data.response.results.map((art): RawNewsArticle => {
        const headline = art.fields?.headline || art.webTitle;
        const description = art.fields?.trailText ? stripHtml(art.fields.trailText) : null;
        const bodyText = art.fields?.bodyText ? art.fields.bodyText.slice(0, 1000) : null;
        const journalistName = art.fields?.byline?.replace(/^by\s+/i, '').trim() || null;

        return {
          externalId: `guardian-${art.id}`,
          headline,
          description,
          bodyText,
          sourceName: 'The Guardian',
          sourceDomain: 'theguardian.com',
          sourceUrl: art.webUrl,
          journalistName,
          publishedAt: art.webPublicationDate,
          imageUrl: art.fields?.thumbnail || null,
          relatedClubHints: [],
          provider: 'guardian',
        };
      });
    } catch {
      return [];
    } finally {
      clearTimeout(timeout);
    }
  },
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '').trim();
}