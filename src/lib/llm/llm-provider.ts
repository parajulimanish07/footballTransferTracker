import { z } from 'zod';

export const TransferArticleAnalysisSchema = z.object({
  summary: z.string(),
  playerName: z.string().nullable(),
  currentClub: z.string().nullable(),
  destinationClub: z.string().nullable(),
  reportedFee: z.string().nullable(),
  direction: z.enum(['incoming', 'outgoing', 'related']).nullable(),
  keyClaims: z.array(z.string()),
  uncertainty: z.enum(['low', 'medium', 'high']),
});

export type TransferArticleAnalysis = z.infer<typeof TransferArticleAnalysisSchema>;

export const GroundedAnswerSchema = z.object({
  answer: z.string(),
  citedArticles: z.array(
    z.object({
      id: z.string(),
      headline: z.string(),
      sourceName: z.string(),
      sourceUrl: z.string(),
    })
  ),
  confidence: z.enum(['high', 'medium', 'low']),
  evidenceFound: z.boolean(),
});

export type GroundedAnswer = z.infer<typeof GroundedAnswerSchema>;

export interface LLMArticleInput {
  id?: string;
  headline: string;
  summary: string;
  sourceName: string;
  sourceUrl?: string;
}

export interface LLMProvider {
  name: string;
  analyseTransferArticle(article: LLMArticleInput): Promise<TransferArticleAnalysis>;
  answerTransferQuestion(question: string, context: LLMArticleInput[]): Promise<GroundedAnswer>;
}
