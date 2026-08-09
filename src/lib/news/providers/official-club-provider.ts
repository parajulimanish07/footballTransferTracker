import type { NewsProvider, RawNewsArticle, TransferNewsQuery } from './provider-types';
import { officialClubSources, isOfficialClubDomain } from '@/config/official-club-sources';
import { parseBbcRssXml } from './bbc-rss-provider';

export const officialClubProvider: NewsProvider = {
  id: 'official-club',
  enabled: true,

  async getTransferNews(options: TransferNewsQuery): Promise<RawNewsArticle[]> {
    const activeSources = officialClubSources.filter((s) => s.enabled && s.rssUrl && s.ingestionMethod === 'rss');
    const articles: RawNewsArticle[] = [];

    const targetSources = options.clubIds?.length
      ? activeSources.filter((s) => options.clubIds?.includes(s.clubId))
      : activeSources;

    await Promise.all(
      targetSources.map(async (source) => {
        if (!source.rssUrl) return;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);

        try {
          const response = await fetch(source.rssUrl, { signal: controller.signal });
          if (!response.ok) return;

          const xml = await response.text();
          const items = parseBbcRssXml(xml);

          items.forEach((item) => {
            // Verify article URL belongs to configured official domain
            try {
              const hostname = new URL(item.sourceUrl).hostname.replace(/^www\./, '').toLowerCase();
              if (hostname !== source.officialDomain && !hostname.endsWith(`.${source.officialDomain}`)) {
                return;
              }
            } catch {
              return;
            }

            articles.push({
              ...item,
              externalId: `official-${source.clubId}-${Buffer.from(item.sourceUrl).toString('base64url')}`,
              sourceName: `${source.clubName} Official`,
              sourceDomain: source.officialDomain,
              journalistName: 'Official Press Office',
              relatedClubHints: [source.clubId],
              provider: 'official-club',
            });
          });
        } catch {
          // Failure isolation per feed
        } finally {
          clearTimeout(timeout);
        }
      })
    );

    return articles.slice(0, options.limit ?? 20);
  },
};
