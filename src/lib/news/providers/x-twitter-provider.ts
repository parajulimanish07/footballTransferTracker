import type { NewsProvider, RawNewsArticle, TransferNewsQuery } from './provider-types';

export const xTwitterProvider: NewsProvider = {
  id: 'x-twitter',
  get enabled() {
    return Boolean(process.env.X_BEARER_TOKEN || process.env.TWITTER_API_KEY);
  },

  async getTransferNews(options: TransferNewsQuery): Promise<RawNewsArticle[]> {
    const bearerToken = process.env.X_BEARER_TOKEN;
    if (!bearerToken) return [];

    // Verified Tier-1 Journalist Handles on X
    const handles = ['FabrizioRomano', 'David_Ornstein', 'DiMarzio', 'Plettigoal', 'Matt_Law_DT'];
    const query = `(${handles.map((h) => `from:${h}`).join(' OR ')}) (transfer OR "here we go" OR signed OR agreed OR medical)`;

    const url = new URL('https://api.twitter.com/2/tweets/search/recent');
    url.searchParams.set('query', query);
    url.searchParams.set('max_results', String(Math.min(options.limit ?? 20, 25)));
    url.searchParams.set('tweet.fields', 'created_at,author_id,entities');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) return [];

      const json = await response.json();
      if (!json.data) return [];

      return json.data.map((tweet: any): RawNewsArticle => {
        return {
          externalId: `x-${tweet.id}`,
          headline: tweet.text.split('\n')[0] || tweet.text.slice(0, 100),
          description: tweet.text,
          bodyText: null,
          sourceName: 'X (Twitter) Insiders',
          sourceDomain: 'x.com',
          sourceUrl: `https://x.com/i/status/${tweet.id}`,
          journalistName: 'Tier-1 Transfer Insider',
          publishedAt: tweet.created_at || new Date().toISOString(),
          imageUrl: null,
          relatedClubHints: [],
          provider: 'manual',
        };
      });
    } catch {
      return [];
    } finally {
      clearTimeout(timeout);
    }
  },
};
