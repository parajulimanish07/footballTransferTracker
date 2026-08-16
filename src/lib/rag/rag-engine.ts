import { defaultLLMProvider } from '../llm/openai-provider';
import type { LLMArticleInput } from '../llm/llm-provider';
import type { FeedMode, TransferStatus } from '@/types/news';
import { searchHybridArticles } from './hybrid-search-engine';
import { parseTransferSearchIntent } from './intent-parser';
import { articleRepository, StoredTransferArticle } from '../storage/article-repository';
import { getActiveEmbeddingProvider } from '../embeddings/embedding-provider';
import { buildArticleEmbeddingText } from '../embeddings/build-article-embedding';
import { resolveTransferEntities } from '../news/resolve-transfer-entities';

export interface RAGArticleItem {
  id: string;
  headline: string;
  summary: string;
  sourceName: string;
  sourceUrl?: string;
  publishedAt?: string;
  playerName?: string | null;
  clubs?: string[];
  currentClubId?: string | null;
  destinationClubId?: string | null;
  reliability?: string;
}

export interface GroundedTransferAnswer {
  answer: string;
  status: TransferStatus | null;
  isConfirmed: boolean;
  confidence: 'low' | 'medium' | 'high';
  evidenceArticleIds: string[];
  conflictingEvidence: boolean;
  insufficientEvidence: boolean;
  latestVerifiedUpdate: string | null;
}

export interface RAGContext {
  mode?: FeedMode;
  selectedClubId?: string | null;
}

export async function queryRAGAssistant(
  question: string,
  liveArticles: RAGArticleItem[] = [],
  context?: RAGContext
): Promise<GroundedTransferAnswer> {
  // 1. Ingest live articles into persistent repository if not already stored
  const embeddingProvider = getActiveEmbeddingProvider();
  for (const item of liveArticles) {
    if (item.id && item.headline) {
      const resolved = resolveTransferEntities(item.headline, item.summary || '');
      const playerName = item.playerName || resolved.playerName || null;
      const currentClubId = item.currentClubId || resolved.currentClub?.id || null;
      const destinationClubId = item.destinationClubId || resolved.destinationClub?.id || (item.clubs?.[0] || null);

      const stored = await articleRepository.saveArticle({
        id: item.id,
        provider: 'live-feed',
        externalId: null,
        sourceUrl: item.sourceUrl || `#${item.id}`,
        canonicalUrl: item.sourceUrl || `#${item.id}`,
        headline: item.headline,
        description: item.summary,
        cleanedText: item.summary,
        sourceName: item.sourceName,
        sourceDomain: item.sourceName.toLowerCase().replace(/\s+/g, ''),
        journalistName: null,
        playerName,
        currentClubId,
        destinationClubId,
        interestedClubId: null,
        leagueId: null,
        transferStatus: (item.reliability === 'official' ? 'official' : 'negotiations') as TransferStatus,
        transferDirection: 'related',
        reliabilityScore: item.reliability === 'official' ? 100 : 80,
        publishedAt: new Date(item.publishedAt || Date.now()),
        humanReviewed: false,
        humanReviewedLabel: null,
        embeddingStatus: 'pending',
        embeddingModel: embeddingProvider.id,
        duplicateGroupId: null,
      });

      // Generate embedding if pending
      if (stored.embeddingStatus === 'pending') {
        try {
          const textToEmbed = buildArticleEmbeddingText(stored);
          const vector = await embeddingProvider.embedText(textToEmbed);
          await articleRepository.saveEmbedding(stored.id, vector, embeddingProvider.id);
        } catch {
          await articleRepository.markEmbeddingFailed(stored.id);
        }
      }
    }
  }

  // 2. Perform Hybrid Retrieval
  const searchLimit = parseInt(process.env.RAG_RETRIEVAL_LIMIT || '20', 10);
  const evidenceLimit = parseInt(process.env.RAG_EVIDENCE_LIMIT || '5', 10);
  const minReliability = parseInt(process.env.RAG_MIN_RELIABILITY || '65', 10);

  const hybridResults = await searchHybridArticles({
    query: question,
    clubIds: context?.mode === 'club' && context.selectedClubId ? [context.selectedClubId] : undefined,
    minimumReliability: minReliability,
    limit: searchLimit,
  });

  const searchIntent = parseTransferSearchIntent(question);
  const selectedCandidates = hybridResults.slice(0, evidenceLimit);
  const topCandidate = selectedCandidates[0];

  const qLower = question.toLowerCase();
  const candidateText = selectedCandidates
    .map((c) => `${c.article.headline} ${c.article.description || ''} ${c.article.playerName || ''}`)
    .join(' ')
    .toLowerCase();

  const hasPlayerMatch = searchIntent.playerName
    ? candidateText.includes(searchIntent.playerName.toLowerCase())
    : true;

  const hasClubMatch = searchIntent.clubIds.length > 0
    ? searchIntent.clubIds.some((id) =>
        candidateText.includes(id.replace(/-/g, ' ')) ||
        selectedCandidates.some(
          (c) =>
            c.article.currentClubId === id ||
            c.article.destinationClubId === id ||
            c.article.interestedClubId === id
        )
      )
    : true;

  const RAG_QUESTION_STOP_WORDS = new Set([
    'which', 'who', 'what', 'where', 'when', 'why', 'how', 'does', 'do', 'did', 'is', 'are', 'was', 'were',
    'has', 'have', 'had', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'signed', 'sign',
    'signing', 'signs', 'join', 'joined', 'joining', 'joins', 'move', 'moved', 'moving', 'moves', 'switch', 'switched',
    'heading', 'heads', 'headed', 'for', 'the', 'club', 'team', 'player', 'players', 'target', 'targets',
    'strikers', 'striker', 'forwards', 'forward', 'wingers', 'winger', 'midfielders', 'midfielder', 'defenders', 'defender',
    'full', 'back', 'fullback', 'centre', 'center', 'left', 'right', 'deal', 'deals', 'agree', 'agreed', 'agrees', 'agreement',
    'transfers', 'transfer', 'news', 'reports', 'reported', 'about', 'tell', 'me', 'show', 'trying', 'want', 'wants', 'been', 'being',
    'with', 'from', 'into', 'over', 'this', 'that', 'latest', 'recent', 'update', 'updates', 'confirm', 'confirmed',
    'milan', 'england', 'english', 'italy', 'italian', 'spain', 'spanish', 'today', 'now', 'currently'
  ]);

  const unlistedTerms = qLower
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3 && !RAG_QUESTION_STOP_WORDS.has(w));

  const mentionsUnmatchedTerm = unlistedTerms.some(
    (term) => !candidateText.includes(term)
  );

  if (
    !selectedCandidates.length ||
    !hasPlayerMatch ||
    !hasClubMatch ||
    mentionsUnmatchedTerm ||
    (topCandidate && topCandidate.keywordScore < 0.1 && topCandidate.semanticScore < 0.15)
  ) {
    return {
      answer: 'There are no verified transfer reports in the database matching your question.',
      status: null,
      isConfirmed: false,
      confidence: 'low',
      evidenceArticleIds: [],
      conflictingEvidence: false,
      insufficientEvidence: true,
      latestVerifiedUpdate: null,
    };
  }

  // 3. Security: Sanitize article text to prevent prompt injection
  const candidateIds = new Set(selectedCandidates.map((c) => c.article.id));
  const sanitizedContext: LLMArticleInput[] = selectedCandidates.map((c) => {
    const cleanHeadline = c.article.headline
      .replace(/ignore previous instructions/gi, '')
      .replace(/system prompt override/gi, '')
      .replace(/disregard above/gi, '');
    const cleanSummary = (c.article.description || '')
      .replace(/ignore previous instructions/gi, '')
      .replace(/system prompt override/gi, '')
      .replace(/disregard above/gi, '');
    return {
      id: c.article.id,
      headline: cleanHeadline,
      summary: cleanSummary,
      sourceName: c.article.sourceName,
      sourceUrl: c.article.sourceUrl,
    };
  });

  // 4. Query LLM & Validate Citations
  const llmResponse = await defaultLLMProvider.answerTransferQuestion(question, sanitizedContext);

  // Validate citations
  const validCitations = (llmResponse.citedArticles || [])
    .map((a) => a.id)
    .filter((id) => candidateIds.has(id));

  const topMatch = selectedCandidates[0].article;
  const isOfficialConfirmed = selectedCandidates.some((c) => c.article.transferStatus === 'official' || c.article.reliabilityScore === 100);

  return {
    answer: llmResponse.answer,
    status: topMatch.transferStatus,
    isConfirmed: isOfficialConfirmed,
    confidence: llmResponse.confidence || 'high',
    evidenceArticleIds: validCitations.length ? validCitations : [topMatch.id],
    conflictingEvidence: false,
    insufficientEvidence: false,
    latestVerifiedUpdate: topMatch.headline,
  };
}
