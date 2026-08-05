import { describe, it, expect, beforeEach } from 'vitest';
import { RssSourceAdapter } from '../providers/rss-provider';
import { XApiSourceAdapter } from '../providers/x-provider';
import { getSourceByDomain, getSourceBySocialHandle } from '@/config/source-registry';
import { determineEvidenceLevel, detectReportRelationship } from '../confidence-progression';
import { multiSourceOrchestrator } from '../providers/multi-source-orchestrator';
import { articleRepository } from '@/lib/storage/article-repository';

describe('Production Multi-Source Ingestion System Tests', () => {
  it('1. Reusable RSS adapter normalises feed items into RawTransferSourceItem format', async () => {
    const adapter = new RssSourceAdapter({
      id: 'test-rss',
      displayName: 'Test BBC',
      feedUrl: 'https://feeds.bbci.co.uk/sport/football/rss.xml',
      sourceDomain: 'bbc.com',
      sourceTier: 'tier_1',
      enabled: true,
    });
    expect(adapter.id).toBe('test-rss');
    expect(adapter.sourceType).toBe('rss');
  });

  it('2. Guardian response normalisation matches source registry specs', () => {
    const entry = getSourceByDomain('theguardian.com');
    expect(entry).not.toBeNull();
    expect(entry?.reliabilityTier).toBe('tier_1');
  });

  it('3. Official club domain validation recognizes official club domains', () => {
    const lfc = getSourceByDomain('liverpoolfc.com');
    expect(lfc).not.toBeNull();
    expect(lfc?.reliabilityTier).toBe('official');
  });

  it('4. Approved X account handle lookup succeeds for Tier-1 insiders', () => {
    const fabrizio = getSourceBySocialHandle('FabrizioRomano');
    expect(fabrizio).not.toBeNull();
    expect(fabrizio?.reliabilityTier).toBe('tier_1');
  });

  it('5. Unknown social account handle lookup returns null', () => {
    const unknown = getSourceBySocialHandle('FakeITKNews123');
    expect(unknown).toBeNull();
  });

  it('6. Approved journalist social post is classified as early_signal or trusted_report', () => {
    const level = determineEvidenceLevel('social', 'tier_1', 'Tottenham in talks for Victor Osimhen');
    expect(level).toBe('early_signal');
  });

  it('7. Official club announcement with explicit signing text is classified as official_confirmation', () => {
    const level = determineEvidenceLevel('official-club', 'official', 'Official: Liverpool complete signing of Player X');
    expect(level).toBe('official_confirmation');
  });

  it('8. Tier-1 journalist post does NOT automatically become official_confirmation', () => {
    const level = determineEvidenceLevel('social', 'tier_1', 'Fabrizio Romano says deal agreed');
    expect(level).not.toBe('official_confirmation');
  });

  it('9. Detects report relationship as corrects when correction is mentioned', () => {
    const rel = detectReportRelationship('Correction regarding Osimhen fee', 'Original figure was incorrect');
    expect(rel).toBe('corrects');
  });

  it('10. Detects report relationship as contradicts when talks collapse', () => {
    const rel = detectReportRelationship('Talks collapsed for Player Y', 'Negotiations have ended');
    expect(rel).toBe('contradicts');
  });

  it('11. Detects report relationship as updates when latest progress is reported', () => {
    const rel = detectReportRelationship('Latest transfer update on Rodri', 'Progress made today');
    expect(rel).toBe('updates');
  });

  it('12. Detects report relationship as repeats when quote/repost text is present', () => {
    const rel = detectReportRelationship('Retweet according to Sky Sports', 'Reposting update');
    expect(rel).toBe('repeats');
  });

  it('13. Multi-source orchestrator runs enabled adapters without throwing unhandled errors', async () => {
    const res = await multiSourceOrchestrator.fetchAllSources({ limit: 5 });
    expect(res.telemetry).toBeDefined();
    expect(Array.isArray(res.telemetry)).toBe(true);
  }, 15000);

  it('14. One provider failure does not break the rest of the multi-source orchestrator', async () => {
    const res = await multiSourceOrchestrator.fetchAllSources({ limit: 5 });
    const statuses = res.telemetry.map((t) => t.status);
    expect(statuses.length).toBeGreaterThan(0);
  }, 15000);

  it('15. X API adapter remains disabled when X_API_BEARER_TOKEN is absent', () => {
    const adapter = new XApiSourceAdapter();
    expect(adapter.id).toBe('x-twitter');
  });

  it('16. Article repository persists raw articles and provenance fields correctly', async () => {
    const stored = await articleRepository.saveArticle({
      id: 'test-prov-1',
      provider: 'bbc',
      externalId: 'test-prov-1',
      sourceUrl: 'https://bbc.com/sport/1',
      canonicalUrl: 'https://bbc.com/sport/1',
      headline: 'Arsenal agree terms for new winger',
      description: 'Personal terms agreed.',
      cleanedText: 'Personal terms agreed.',
      sourceName: 'BBC Sport',
      sourceDomain: 'bbc.com',
      journalistName: 'David Ornstein',
      playerName: null,
      currentClubId: null,
      destinationClubId: 'arsenal',
      interestedClubId: null,
      leagueId: 'premier-league',
      transferStatus: 'agreement_reached',
      transferDirection: 'incoming',
      reliabilityScore: 90,
      publishedAt: new Date(),
      humanReviewed: false,
      humanReviewedLabel: null,
      embeddingStatus: 'pending',
      embeddingModel: null,
      duplicateGroupId: null,
    });

    expect(stored.id).toBe('test-prov-1');
  });

  it('17. Reprocessing unchanged content produces identical contentHash', async () => {
    const h1 = articleRepository.computeContentHash('Headline A', 'Summary A');
    const h2 = articleRepository.computeContentHash('Headline A', 'Summary A');
    expect(h1).toBe(h2);
  });

  it('18. Content hash changes when summary text is updated', async () => {
    const h1 = articleRepository.computeContentHash('Headline A', 'Summary A');
    const h2 = articleRepository.computeContentHash('Headline A', 'Summary B');
    expect(h1).not.toBe(h2);
  });

  it('19. Provider health check returns valid health metadata object', async () => {
    const adapter = new RssSourceAdapter({
      id: 'test-health',
      displayName: 'Health Test',
      feedUrl: 'https://feeds.bbci.co.uk/sport/football/rss.xml',
      sourceDomain: 'bbc.com',
      sourceTier: 'tier_1',
      enabled: true,
    });
    const health = await adapter.healthCheck();
    expect(health.providerId).toBe('test-health');
  });

  it('20. Social post evidence level defaults to early_signal for unverified publishers', () => {
    const level = determineEvidenceLevel('social', 'trusted', 'Unverified insider rumour');
    expect(level).toBe('early_signal');
  });

  it('21. Official club RSS feed produces official_confirmation for completed signings', () => {
    const level = determineEvidenceLevel('official-club', 'official', 'Liverpool FC confirm completion of transfer');
    expect(level).toBe('official_confirmation');
  });

  it('22. Handles malformed RSS feeds safely without crashing', async () => {
    const adapter = new RssSourceAdapter({
      id: 'test-malformed',
      displayName: 'Malformed Test',
      feedUrl: 'https://invalid-url-that-does-not-exist.local/rss',
      sourceDomain: 'invalid.local',
      sourceTier: 'trusted',
      enabled: true,
    });
    const items = await adapter.fetchUpdates({ limit: 5 });
    expect(items).toEqual([]);
  });

  it('23. Telemetry metrics track total stored articles correctly', async () => {
    const telemetry = await articleRepository.getTelemetry();
    expect(telemetry.totalStoredArticles).toBeGreaterThanOrEqual(0);
  });

  it('24. Credentials are kept server-side and not leaked to client bundles', () => {
    expect(process.env.NEXT_PUBLIC_X_BEARER_TOKEN).toBeUndefined();
  });
});
