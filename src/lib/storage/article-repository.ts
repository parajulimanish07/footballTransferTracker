import type { TransferStatus } from '@/types/news';
import crypto from 'crypto';

export interface StoredTransferArticle {
  id: string;
  provider: string;
  externalId: string | null;
  sourceUrl: string;
  canonicalUrl: string;
  headline: string;
  description: string | null;
  cleanedText: string;
  sourceName: string;
  sourceDomain: string;
  journalistName: string | null;
  playerName: string | null;
  currentClubId: string | null;
  destinationClubId: string | null;
  interestedClubId: string | null;
  leagueId: string | null;
  transferStatus: TransferStatus;
  transferDirection: 'incoming' | 'outgoing' | 'related' | null;
  reliabilityScore: number;
  publishedAt: Date;
  firstFetchedAt: Date;
  lastFetchedAt: Date;
  duplicateGroupId: string | null;
  humanReviewed: boolean;
  humanReviewedLabel: TransferStatus | null;
  embeddingStatus: 'pending' | 'completed' | 'failed';
  embeddingModel: string | null;
  contentHash: string;
  embedding?: number[];
}

export interface QueryArticleFilters {
  playerName?: string;
  clubIds?: string[];
  leagueIds?: string[];
  transferStatuses?: TransferStatus[];
  minimumReliability?: number;
  publishedAfter?: Date;
  embeddingStatus?: 'pending' | 'completed' | 'failed';
  limit?: number;
}

export interface TelemetryMetrics {
  totalStoredArticles: number;
  pendingEmbeddings: number;
  completedEmbeddings: number;
  failedEmbeddings: number;
  vectorSearchLatencyMs: number;
  retrievedCandidateAvg: number;
  evidenceAvg: number;
  insufficientEvidenceRate: number;
  citationValidationFailures: number;
}

export class InMemoryArticleRepository {
  private articles = new Map<string, StoredTransferArticle>();
  private embeddings = new Map<string, { vector: number[]; model: string; dimensions: number }>();
  private telemetry: TelemetryMetrics = {
    totalStoredArticles: 0,
    pendingEmbeddings: 0,
    completedEmbeddings: 0,
    failedEmbeddings: 0,
    vectorSearchLatencyMs: 0,
    retrievedCandidateAvg: 0,
    evidenceAvg: 0,
    insufficientEvidenceRate: 0,
    citationValidationFailures: 0,
  };

  computeContentHash(headline: string, description: string | null): string {
    return crypto.createHash('sha256').update(`${headline}:${description || ''}`).digest('hex');
  }

  private rawArticlesMap = new Map<string, any>();

  saveRawArticle(raw: any): any {
    const id = raw.id || raw.externalId || `raw-${Date.now()}-${Math.random()}`;
    const stored = { ...raw, id, humanReviewed: raw.humanReviewed || false };
    this.rawArticlesMap.set(id, stored);
    return stored;
  }

  getUnreviewedArticles(): any[] {
    return Array.from(this.rawArticlesMap.values()).filter((a) => !a.humanReviewed);
  }

  getExportableDataset(): any[] {
    return Array.from(this.rawArticlesMap.values()).filter((a) => a.humanReviewed);
  }

  getHumanReviewedArticles(): any[] {
    return this.getExportableDataset();
  }

  getAll(): any[] {
    return Array.from(this.rawArticlesMap.values());
  }

  getByUrl(url: string): any | null {
    return Array.from(this.rawArticlesMap.values()).find((a) => a.sourceUrl === url) || null;
  }

  updateProcessedArticle(id: string, updates: any): void {
    const raw = this.rawArticlesMap.get(id);
    if (raw) {
      Object.assign(raw, updates);
      if (updates.humanLabel) {
        raw.humanReviewed = true;
      }
    }
  }

  async saveArticle(input: Omit<StoredTransferArticle, 'contentHash' | 'firstFetchedAt' | 'lastFetchedAt'>): Promise<StoredTransferArticle> {
    const contentHash = this.computeContentHash(input.headline, input.description);
    const existing = Array.from(this.articles.values()).find(
      (a) => a.sourceUrl === input.sourceUrl || a.contentHash === contentHash
    );

    if (existing) {
      existing.lastFetchedAt = new Date();
      return existing;
    }

    const now = new Date();
    const stored: StoredTransferArticle = {
      ...input,
      contentHash,
      firstFetchedAt: now,
      lastFetchedAt: now,
    };

    this.articles.set(stored.id, stored);
    this.updateTelemetryCounters();
    return stored;
  }

  async getArticleById(id: string): Promise<StoredTransferArticle | null> {
    return this.articles.get(id) ?? null;
  }

  async saveEmbedding(articleId: string, embedding: number[], model: string): Promise<void> {
    const article = this.articles.get(articleId);
    if (article) {
      article.embedding = embedding;
      article.embeddingStatus = 'completed';
      article.embeddingModel = model;
      this.embeddings.set(articleId, { vector: embedding, model, dimensions: embedding.length });
      this.updateTelemetryCounters();
    }
  }

  async markEmbeddingFailed(articleId: string): Promise<void> {
    const article = this.articles.get(articleId);
    if (article) {
      article.embeddingStatus = 'failed';
      this.updateTelemetryCounters();
    }
  }

  async queryArticles(filters: QueryArticleFilters = {}): Promise<StoredTransferArticle[]> {
    let result = Array.from(this.articles.values());

    if (filters.embeddingStatus) {
      result = result.filter((a) => a.embeddingStatus === filters.embeddingStatus);
    }

    if (filters.playerName) {
      const p = filters.playerName.toLowerCase();
      result = result.filter((a) => a.playerName && a.playerName.toLowerCase().includes(p));
    }

    if (filters.clubIds?.length) {
      const cSet = new Set(filters.clubIds);
      result = result.filter(
        (a) =>
          (a.currentClubId && cSet.has(a.currentClubId)) ||
          (a.destinationClubId && cSet.has(a.destinationClubId)) ||
          (a.interestedClubId && cSet.has(a.interestedClubId))
      );
    }

    if (filters.leagueIds?.length) {
      const lSet = new Set(filters.leagueIds);
      result = result.filter((a) => a.leagueId && lSet.has(a.leagueId));
    }

    if (filters.transferStatuses?.length) {
      const sSet = new Set(filters.transferStatuses);
      result = result.filter((a) => sSet.has(a.transferStatus));
    }

    if (filters.minimumReliability) {
      result = result.filter((a) => a.reliabilityScore >= filters.minimumReliability!);
    }

    if (filters.publishedAfter) {
      result = result.filter((a) => new Date(a.publishedAt) >= filters.publishedAfter!);
    }

    if (filters.limit) {
      result = result.slice(0, filters.limit);
    }

    return result;
  }

  async getTelemetry(): Promise<TelemetryMetrics> {
    return this.telemetry;
  }

  private updateTelemetryCounters() {
    const all = Array.from(this.articles.values());
    this.telemetry.totalStoredArticles = all.length;
    this.telemetry.pendingEmbeddings = all.filter((a) => a.embeddingStatus === 'pending').length;
    this.telemetry.completedEmbeddings = all.filter((a) => a.embeddingStatus === 'completed').length;
    this.telemetry.failedEmbeddings = all.filter((a) => a.embeddingStatus === 'failed').length;
  }
}

export const articleRepository = new InMemoryArticleRepository();
