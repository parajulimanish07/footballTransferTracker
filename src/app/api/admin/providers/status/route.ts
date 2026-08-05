import { NextResponse } from 'next/server';
import { multiProvider, registeredProviders } from '@/lib/news/providers/multi-provider';

const PROVIDER_NAMES: Record<string, string> = {
  guardian: 'The Guardian Open Platform API',
  'bbc-rss': 'BBC Sport Football RSS Feed',
  'official-club': 'Official Club RSS & Press Feeds',
  manual: 'Manual Trusted Submissions Repository',
  'api-football': 'API-Football Official Database',
  'x-twitter': 'X / Twitter Verified Journalists',
  gnews: 'GNews Discovery API Provider',
  newsapi: 'NewsAPI Backup Provider',
};

export async function GET() {
  try {
    const response = await multiProvider.getTransferNewsWithHealth({ limit: 20 });

    const enabledNames = (process.env.NEWS_PROVIDERS || 'guardian,bbc-rss,official-club,manual,api-football,newsapi,gnews')
      .toLowerCase()
      .split(',')
      .map((s) => s.trim());

    const providerStatusList = registeredProviders.map((provider) => {
      const health = response.providerHealth.find((h) => h.id === provider.id);
      const isEnabled = enabledNames.includes(provider.id) && provider.enabled;
      const articlesFromProvider = response.data.filter((item) => item.id.startsWith(provider.id));

      return {
        id: provider.id,
        name: PROVIDER_NAMES[provider.id] || provider.id,
        enabled: isEnabled,
        lastFetch: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lastError: health?.status === 'failed' ? (health.error || 'Connection error') : (!isEnabled ? 'Provider disabled or API key missing' : null),
        receivedCount: health?.articleCount || 0,
        acceptedCount: articlesFromProvider.length,
        rejectedCount: Math.max(0, (health?.articleCount || 0) - articlesFromProvider.length),
        duplicateCount: 0,
      };
    });

    return NextResponse.json({
      providers: providerStatusList,
      totalArticles: response.data.length,
      lastSynced: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch provider status' }, { status: 500 });
  }
}
