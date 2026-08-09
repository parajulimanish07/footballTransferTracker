import type { TransferStatus } from '@/types/news';

export interface MLPredictionResult {
  prediction: TransferStatus;
  confidence: number;
  modelVersion: string;
  probabilities?: Record<string, number>;
  decisionScores?: Record<string, number>;
  reasoningSignals: string[];
  ruleOverride: string | null;
  needsReview: boolean;
}

export interface DuplicatePairResult {
  candidateId: string;
  relationship: 'duplicate' | 'related' | 'separate';
  similarity: number;
  reasons: string[];
}

export interface DuplicateDetectResponse {
  targetId: string;
  primaryStoryId: string;
  results: DuplicatePairResult[];
}

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_CONFIDENCE_THRESHOLD = parseFloat(process.env.ML_CONFIDENCE_THRESHOLD || '0.65');
const DUPLICATE_SIMILARITY_THRESHOLD = parseFloat(process.env.DUPLICATE_SIMILARITY_THRESHOLD || '0.82');

// Circuit breaker to avoid network timeout stalls when Python ML microservice is offline
let mlCircuitOpen = false;
let mlCircuitNextRetry = 0;

function isMlServiceAvailable(): boolean {
  if (!mlCircuitOpen) return true;
  if (Date.now() > mlCircuitNextRetry) {
    mlCircuitOpen = false;
    return true;
  }
  return false;
}

function recordMlServiceFailure() {
  mlCircuitOpen = true;
  mlCircuitNextRetry = Date.now() + 60000; // Fast-fail for 60 seconds
}

function recordMlServiceSuccess() {
  mlCircuitOpen = false;
  mlCircuitNextRetry = 0;
}

/**
 * Predicts transfer status using Python FastAPI ML Service, falling back gracefully to deterministic rules.
 */
export async function predictTransferStatus(options: {
  headline: string;
  description?: string | null;
  sourceDomain?: string | null;
  isOfficial?: boolean;
}): Promise<MLPredictionResult> {
  // Official source rule override
  if (options.isOfficial || (options.sourceDomain && ['official', 'premierleague.com', 'realmadrid.com', 'liverpoolfc.com', 'arsenal.com'].some(d => options.sourceDomain?.toLowerCase().includes(d)))) {
    return {
      prediction: 'official',
      confidence: 1.0,
      modelVersion: 'official-rule-override-v1',
      reasoningSignals: ['Official club announcement / direct press release'],
      ruleOverride: 'Official Announcement Rule Override',
      needsReview: false,
    };
  }

  if (isMlServiceAvailable()) {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/predict-transfer-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: options.headline,
          description: options.description ?? '',
          sourceDomain: options.sourceDomain ?? '',
          isOfficial: Boolean(options.isOfficial),
        }),
        signal: AbortSignal.timeout(1000), // Fast 1s timeout
      });

      if (response.ok) {
        recordMlServiceSuccess();
        const data = await response.json();
        return {
          prediction: (data.prediction.toLowerCase() as TransferStatus) || 'interest',
          confidence: data.confidence ?? 0.8,
          modelVersion: data.modelVersion ?? 'ml-fastapi-v1',
          probabilities: data.probabilities,
          decisionScores: data.decisionScores,
          reasoningSignals: data.reasoningSignals ?? [],
          ruleOverride: data.ruleOverride ?? null,
          needsReview: (data.confidence ?? 0.8) < ML_CONFIDENCE_THRESHOLD,
        };
      }
    } catch {
      recordMlServiceFailure();
    }
  }

  return fallbackDeterministicPrediction(options.headline, options.description ?? '');
}

import { classifyTransferStatus, isTransferNews } from '@/lib/news/classify-transfer-status';

/**
 * JS/TS Fallback for Transfer Status Classification
 */
function fallbackDeterministicPrediction(headline: string, description: string): MLPredictionResult {
  const isTransfer = isTransferNews(headline, description);

  if (!isTransfer) {
    return {
      prediction: 'not_transfer_news',
      confidence: 0.95,
      modelVersion: 'non-transfer-filter-v1',
      reasoningSignals: ['Filtered non-transfer news topic'],
      ruleOverride: 'Non-Transfer Filter Override',
      needsReview: false,
    };
  }

  const prediction = classifyTransferStatus(headline, description, false);
  const confidence = prediction === 'official' ? 0.95 : prediction === 'agreement_reached' ? 0.90 : 0.82;

  return {
    prediction,
    confidence,
    modelVersion: 'deterministic-rule-fallback-v1',
    reasoningSignals: [`Status classified as ${prediction}`],
    ruleOverride: null,
    needsReview: confidence < ML_CONFIDENCE_THRESHOLD,
  };
}

/**
 * Detects duplicate articles via TF-IDF Cosine Similarity
 */
export async function detectDuplicates(
  target: { id: string; headline: string; description?: string; playerName?: string; clubs?: string[]; publishedAt?: string; sourceDomain?: string },
  candidates: Array<{ id: string; headline: string; description?: string; playerName?: string; clubs?: string[]; publishedAt?: string; sourceDomain?: string }>
): Promise<DuplicateDetectResponse> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/detect-duplicates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target,
        candidates,
        similarityThreshold: DUPLICATE_SIMILARITY_THRESHOLD,
        relatedThreshold: 0.68,
      }),
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback JS TF-IDF / Jaccard similarity implementation
  }

  return fallbackDuplicateDetection(target, candidates);
}

/**
 * Pure JS TF-IDF & Cosine Similarity Fallback
 */
function fallbackDuplicateDetection(
  target: any,
  candidates: any[]
): DuplicateDetectResponse {
  const results: DuplicatePairResult[] = [];
  const primaryId = target.id;

  const targetTokens = tokenize(`${target.headline} ${target.description || ''}`);

  candidates.forEach((candidate) => {
    const candidateTokens = tokenize(`${candidate.headline} ${candidate.description || ''}`);
    const similarity = calculateJaccardSimilarity(targetTokens, candidateTokens);
    const reasons: string[] = [];

    if (target.playerName && candidate.playerName && target.playerName.toLowerCase() === candidate.playerName.toLowerCase()) {
      reasons.push(`Same player: ${target.playerName}`);
    }

    if (similarity >= DUPLICATE_SIMILARITY_THRESHOLD || (similarity >= 0.60 && reasons.length > 0)) {
      results.push({
        candidateId: candidate.id,
        relationship: 'duplicate',
        similarity: round(similarity, 2),
        reasons: [...reasons, `High text similarity (${round(similarity, 2)})`],
      });
    } else if (similarity >= 0.50) {
      results.push({
        candidateId: candidate.id,
        relationship: 'related',
        similarity: round(similarity, 2),
        reasons: [`Moderate text similarity (${round(similarity, 2)})`],
      });
    } else {
      results.push({
        candidateId: candidate.id,
        relationship: 'separate',
        similarity: round(similarity, 2),
        reasons: ['Low text similarity'],
      });
    }
  });

  return { targetId: target.id, primaryStoryId: primaryId, results };
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (!setA.size || !setB.size) return 0;
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

function round(val: number, decimals: number): number {
  return Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
