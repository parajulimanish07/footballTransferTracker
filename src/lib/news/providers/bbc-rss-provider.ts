import type { NewsProvider, RawNewsArticle, TransferNewsQuery } from './provider-types';

export const bbcRssProvider: NewsProvider = {
  id: 'bbc-rss',
  enabled: true,

  async getTransferNews(options: TransferNewsQuery): Promise<RawNewsArticle[]> {
    const feedUrl = 'http://feeds.bbci.co.uk/sport/football/rss.xml';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(feedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PitchPulse/1.0',
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
        next: { revalidate: 300 },
      });

      if (!response.ok) throw new Error(`BBC RSS returned status ${response.status}`);
      const xmlText = await response.text();

      return parseBbcRssXml(xmlText).slice(0, options.limit ?? 20);
    } catch {
      return [];
    } finally {
      clearTimeout(timeout);
    }
  },
};

export function parseBbcRssXml(xmlText: string): RawNewsArticle[] {
  const articles: RawNewsArticle[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;

  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];

    const title = getXmlTag(itemContent, 'title');
    const description = getXmlTag(itemContent, 'description');
    const link = getXmlTag(itemContent, 'link');
    const guid = getXmlTag(itemContent, 'guid') || link;
    const pubDateStr = getXmlTag(itemContent, 'pubDate');

    if (!title || !link) continue;

    const publishedAt = pubDateStr ? new Date(pubDateStr).toISOString() : new Date().toISOString();

    articles.push({
      externalId: `bbc-rss-${Buffer.from(guid || link).toString('base64url')}`,
      headline: cleanXmlString(title),
      description: description ? cleanXmlString(description) : null,
      bodyText: null, // Full body scraping is strictly prohibited for copyright compliance
      sourceName: 'BBC Sport',
      sourceDomain: 'bbc.co.uk',
      sourceUrl: link,
      journalistName: 'BBC Sport Reporter',
      publishedAt,
      imageUrl: null,
      relatedClubHints: [],
      provider: 'bbc-rss',
    });
  }

  return articles;
}

function getXmlTag(xml: string, tagName: string): string | null {
  const cdataRegex = new RegExp(`<${tagName}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tagName}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  const standardRegex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const standardMatch = xml.match(standardRegex);
  if (standardMatch) return standardMatch[1].trim();

  return null;
}

function cleanXmlString(str: string): string {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>?/gm, '')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}
