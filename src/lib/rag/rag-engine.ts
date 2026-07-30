import { defaultLLMProvider } from '../llm/openai-provider';
import type { GroundedAnswer, LLMArticleInput } from '../llm/llm-provider';

export interface RAGArticleItem {
  id: string;
  headline: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  reliability: string;
  playerName?: string | null;
  clubs?: string[];
}

/**
 * RAG Engine: Ranks articles by relevance, reliability, and recency, then queries LLM Provider for a grounded answer.
 */
export async function queryRAGAssistant(
  question: string,
  articles: RAGArticleItem[]
): Promise<GroundedAnswer> {
  const ranked = rankArticlesByRelevance(question, articles);
  const selectedContext: LLMArticleInput[] = ranked.slice(0, 4).map((a) => ({
    id: a.id,
    headline: a.headline,
    summary: a.summary,
    sourceName: a.sourceName,
    sourceUrl: a.sourceUrl,
  }));

  return await defaultLLMProvider.answerTransferQuestion(question, selectedContext);
}

function rankArticlesByRelevance(question: string, articles: RAGArticleItem[]): RAGArticleItem[] {
  const qTokens = new Set(question.toLowerCase().split(/\s+/).filter((w) => w.length > 2));

  return [...articles].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Entity & keyword matching
    const textA = `${a.headline} ${a.summary} ${a.playerName || ''} ${a.clubs?.join(' ') || ''}`.toLowerCase();
    const textB = `${b.headline} ${b.summary} ${b.playerName || ''} ${b.clubs?.join(' ') || ''}`.toLowerCase();

    qTokens.forEach((token) => {
      if (textA.includes(token)) scoreA += 10;
      if (textB.includes(token)) scoreB += 10;
    });

    // Reliability weights
    if (a.reliability === 'official') scoreA += 25;
    if (b.reliability === 'official') scoreB += 25;
    if (a.reliability === 'tier_1') scoreA += 15;
    if (b.reliability === 'tier_1') scoreB += 15;

    // Recency weights
    const ageA = Date.now() - new Date(a.publishedAt).getTime();
    const ageB = Date.now() - new Date(b.publishedAt).getTime();
    scoreA += Math.max(0, 10 - ageA / (1000 * 60 * 60 * 24));
    scoreB += Math.max(0, 10 - ageB / (1000 * 60 * 60 * 24));

    return scoreB - scoreA;
  });
}
