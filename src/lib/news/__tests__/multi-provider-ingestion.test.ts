import { describe, it, expect } from 'vitest';
import { parseBbcRssXml } from '../providers/bbc-rss-provider';
import { isOfficialClubDomain } from '@/config/official-club-sources';
import { articleRepository } from '@/lib/storage/article-repository';

describe('Multi-Provider Football Transfer News Ingestion Suite', () => {
  it('parses BBC RSS XML correctly and preserves attribution without full body scraping', () => {
    const sampleXml = `
      <rss version="2.0">
        <channel>
          <title>BBC Sport - Football</title>
          <item>
            <title><![CDATA[Arsenal agree deal for Calafiori]]></title>
            <description><![CDATA[Arsenal have reached full agreement for Italian defender Riccardo Calafiori.]]></description>
            <link>https://www.bbc.co.uk/sport/football/articles/c12345</link>
            <guid>https://www.bbc.co.uk/sport/football/articles/c12345</guid>
            <pubDate>Thu, 28 Jul 2026 14:00:00 GMT</pubDate>
          </item>
        </channel>
      </rss>
    `;

    const parsed = parseBbcRssXml(sampleXml);
    expect(parsed.length).toBe(1);
    expect(parsed[0].headline).toBe('Arsenal agree deal for Calafiori');
    expect(parsed[0].sourceName).toBe('BBC Sport');
    expect(parsed[0].sourceDomain).toBe('bbc.co.uk');
    expect(parsed[0].bodyText).toBeNull(); // Full body text is null for copyright compliance
    expect(parsed[0].provider).toBe('bbc-rss');
  });

  it('validates official club domains correctly', () => {
    expect(isOfficialClubDomain('liverpoolfc.com')).toBe(true);
    expect(isOfficialClubDomain('www.arsenal.com')).toBe(true);
    expect(isOfficialClubDomain('random-unverified-site.com')).toBe(false);
  });

  it('filters dataset export to contain ONLY human-reviewed articles', () => {
    const rawId = `test-raw-${Date.now()}`;
    const reviewedId = `test-rev-${Date.now()}`;

    articleRepository.saveRawArticle({
      externalId: rawId,
      headline: 'Unreviewed Article',
      description: 'Test description',
      bodyText: null,
      sourceName: 'BBC Sport',
      sourceDomain: 'bbc.co.uk',
      sourceUrl: `https://bbc.co.uk/test-${rawId}`,
      journalistName: null,
      publishedAt: new Date().toISOString(),
      imageUrl: null,
      relatedClubHints: [],
      provider: 'bbc-rss',
    });

    articleRepository.saveRawArticle({
      externalId: reviewedId,
      headline: 'Reviewed Article',
      description: 'Test description',
      bodyText: null,
      sourceName: 'The Guardian',
      sourceDomain: 'theguardian.com',
      sourceUrl: `https://theguardian.com/test-${reviewedId}`,
      journalistName: 'David Ornstein',
      publishedAt: new Date().toISOString(),
      imageUrl: null,
      relatedClubHints: [],
      provider: 'guardian',
    });

    // Mark ONLY reviewedId with human label
    articleRepository.updateProcessedArticle(reviewedId, {
      humanLabel: 'AGREEMENT_REACHED',
    });

    const reviewedOnly = articleRepository.getHumanReviewedArticles();
    const ids = reviewedOnly.map((r) => r.externalId);

    expect(ids).toContain(reviewedId);
    expect(ids).not.toContain(rawId);
  });
});
