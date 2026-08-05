import type { TransferSourceAdapter, TransferSourceQuery, RawTransferSourceItem, SourceHealthResult } from './source-adapter';
import crypto from 'crypto';

export interface RssSourceConfig {
  id: string;
  displayName: string;
  feedUrl: string;
  sourceDomain: string;
  sourceTier: 'official' | 'tier_1' | 'tier_2' | 'trusted';
  enabled: boolean;
}

export class RssSourceAdapter implements TransferSourceAdapter {
  id: string;
  displayName: string;
  sourceType = 'rss' as const;
  enabled: boolean;
  private feedUrl: string;
  private sourceDomain: string;

  constructor(config: RssSourceConfig) {
    this.id = config.id;
    this.displayName = config.displayName;
    this.feedUrl = config.feedUrl;
    this.sourceDomain = config.sourceDomain;
    this.enabled = config.enabled;
  }

  async fetchUpdates(query: TransferSourceQuery): Promise<RawTransferSourceItem[]> {
    if (!this.enabled) return [];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    try {
      const response = await fetch(this.feedUrl, {
        headers: { 'User-Agent': 'PitchPulseBot/1.0 (+https://transfer-tracker.local)' },
        signal: controller.signal,
      });

      if (!response.ok) return [];
      const xmlText = await response.text();
      return this.parseRssItems(xmlText, query.limit || 15);
    } catch {
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }

  async healthCheck(): Promise<SourceHealthResult> {
    const start = performance.now();
    const items = await this.fetchUpdates({ limit: 5 });
    return {
      providerId: this.id,
      status: items.length ? 'success' : 'failed',
      fetchedCount: items.length,
      acceptedCount: items.length,
      rejectedCount: 0,
      duplicateCount: 0,
      lastSuccessfulFetch: items.length ? new Date().toISOString() : null,
      lastError: items.length ? null : 'Feed unreachable or returned 0 items',
    };
  }

  private parseRssItems(xmlText: string, limit: number): RawTransferSourceItem[] {
    const items: RawTransferSourceItem[] = [];
    const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || xmlText.match(/<entry[\s\S]*?<\/entry>/gi) || [];

    for (const itemXml of itemMatches.slice(0, limit)) {
      const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i) || itemXml.match(/href="([^"]+)"/i);
      const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i) || itemXml.match(/<summary>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i);
      const dateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/i) || itemXml.match(/<updated>(.*?)<\/updated>/i);

      const headline = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';
      const originalUrl = linkMatch ? linkMatch[1].trim() : '';
      const description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : null;
      const pubDate = dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString();

      if (headline && originalUrl) {
        const externalId = `${this.id}-${crypto.createHash('md5').update(originalUrl).digest('hex').slice(0, 12)}`;
        items.push({
          providerId: this.id,
          externalId,
          sourceType: 'rss',
          headline,
          description,
          permittedBodyText: description,
          originalUrl,
          canonicalUrl: originalUrl,
          sourceName: this.displayName,
          sourceDomain: this.sourceDomain,
          authorName: null,
          authorExternalId: null,
          publishedAt: pubDate,
          fetchedAt: new Date().toISOString(),
          imageUrl: null,
          socialPostId: null,
          socialAccountHandle: null,
          socialAccountVerifiedByApp: false,
          rawMetadata: {},
        });
      }
    }

    return items;
  }
}
