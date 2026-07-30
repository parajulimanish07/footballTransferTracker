import type { NewsProvider } from './providers/provider-types';
import { multiProvider } from './providers/multi-provider';
import { mockNewsProvider } from './providers/mock-provider';
import { newsApiProvider } from './providers/news-api-provider';
import { gnewsProvider } from './providers/gnews-provider';
import { guardianProvider } from './providers/guardian-provider';

export function getActiveProvider(): NewsProvider {
  const mode = (process.env.NEWS_PROVIDER ?? 'multi').toLowerCase();
  switch (mode) {
    case 'newsapi':
      return process.env.NEWS_API_KEY ? newsApiProvider : mockNewsProvider;
    case 'gnews':
      return process.env.GNEWS_API_KEY ? gnewsProvider : mockNewsProvider;
    case 'guardian':
      return process.env.GUARDIAN_API_KEY ? guardianProvider : mockNewsProvider;
    case 'mock':
      return mockNewsProvider;
    case 'multi':
    default:
      return multiProvider as unknown as NewsProvider;
  }
}