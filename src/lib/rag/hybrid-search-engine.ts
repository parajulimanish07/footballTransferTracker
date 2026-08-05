import { getActiveEmbeddingProvider } from '@/lib/embeddings/embedding-provider';
import { articleRepository, StoredTransferArticle, QueryArticleFilters } from '@/lib/storage/article-repository';
import { parseTransferSearchIntent, TransferSearchIntent } from './intent-parser';

export interface SemanticSearchQuery extends QueryArticleFilters {
  query: string;
}

export interface SemanticSearchResult {
  article: StoredTransferArticle;
  semanticScore: number;
  keywordScore: number;
  reliabilityScore: number;
  recencyScore: number;
  finalRetrievalScore: number;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (!normA || !normB) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function searchHybridArticles(query: SemanticSearchQuery): Promise<SemanticSearchResult[]> {
  const embeddingProvider = getActiveEmbeddingProvider();
  const startTime = performance.now();

  // 1. Embed question text
  let questionVector: number[] = [];
  try {
    questionVector = await embeddingProvider.embedText(query.query);
  } catch {
    // If embedding provider fails, vector search is skipped (semanticScore = 0)
  }

  // 2. Intent extraction & Repository candidate retrieval
  const intent = parseTransferSearchIntent(query.query);
  const candidates = await articleRepository.queryArticles({
    playerName: query.playerName || intent.playerName || undefined,
    clubIds: query.clubIds?.length ? query.clubIds : intent.clubIds.length ? intent.clubIds : undefined,
    leagueIds: query.leagueIds?.length ? query.leagueIds : intent.leagueIds.length ? intent.leagueIds : undefined,
    transferStatuses: query.transferStatuses,
    minimumReliability: query.minimumReliability,
    publishedAfter: query.publishedAfter,
    limit: query.limit || 50,
  });

  // 3. Retrieval Weights
  const wSemantic = parseFloat(process.env.RAG_SEMANTIC_WEIGHT || '0.40');
  const wKeyword = parseFloat(process.env.RAG_KEYWORD_WEIGHT || '0.25');
  const wReliability = parseFloat(process.env.RAG_RELIABILITY_WEIGHT || '0.20');
  const wRecency = parseFloat(process.env.RAG_RECENCY_WEIGHT || '0.15');

  const qTokens = new Set(query.query.toLowerCase().split(/\s+/).filter((w) => w.length > 2));
  const nowMs = Date.now();

  const results: SemanticSearchResult[] = candidates.map((article) => {
    // Semantic Score (Cosine similarity)
    let semanticScore = 0;
    if (questionVector.length && article.embedding?.length) {
      semanticScore = Math.max(0, cosineSimilarity(questionVector, article.embedding));
    }

    // Keyword & Entity Score
    let keywordHits = 0;
    const fullText = `${article.headline} ${article.description || ''} ${article.playerName || ''} ${article.cleanedText || ''}`.toLowerCase();
    qTokens.forEach((token) => {
      if (fullText.includes(token)) keywordHits++;
    });

    // Synonym Wording Extra Boost (e.g. Tottenham <-> Spurs, striker <-> forward)
    if (
      (query.query.toLowerCase().includes('tottenham') || query.query.toLowerCase().includes('spurs')) &&
      (fullText.includes('tottenham') || fullText.includes('spurs'))
    ) {
      keywordHits += 2;
    }
    if (
      (query.query.toLowerCase().includes('striker') || query.query.toLowerCase().includes('forward')) &&
      (fullText.includes('striker') || fullText.includes('forward') || fullText.includes('attacker'))
    ) {
      keywordHits += 2;
    }
    if (
      (query.query.toLowerCase().includes('trying to sign') || query.query.toLowerCase().includes('approach')) &&
      (fullText.includes('approach') || fullText.includes('bid') || fullText.includes('target'))
    ) {
      keywordHits += 2;
    }

    const keywordScore = Math.min(1, keywordHits / Math.max(1, qTokens.size));

    // Reliability Score (Normalized 0..1)
    const reliabilityScore = Math.min(1, article.reliabilityScore / 100);

    // Recency Score (Decay over 14 days)
    const ageDays = (nowMs - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - ageDays / 14);

    // Final Composite Retrieval Score
    const finalRetrievalScore =
      semanticScore * wSemantic +
      keywordScore * wKeyword +
      reliabilityScore * wReliability +
      recencyScore * wRecency;

    return {
      article,
      semanticScore,
      keywordScore,
      reliabilityScore,
      recencyScore,
      finalRetrievalScore,
    };
  });

  // Sort by final score descending
  results.sort((a, b) => b.finalRetrievalScore - a.finalRetrievalScore);

  // Group exact/near duplicate stories
  const deduplicated: SemanticSearchResult[] = [];
  const seenGroupIds = new Set<string>();

  for (const item of results) {
    const groupId = item.article.duplicateGroupId || item.article.contentHash;
    if (!seenGroupIds.has(groupId)) {
      seenGroupIds.add(groupId);
      deduplicated.push(item);
    }
  }

  const searchDurationMs = performance.now() - startTime;
  const telemetry = await articleRepository.getTelemetry();
  telemetry.vectorSearchLatencyMs = Math.round(searchDurationMs);
  telemetry.retrievedCandidateAvg = deduplicated.length;

  return deduplicated;
}
