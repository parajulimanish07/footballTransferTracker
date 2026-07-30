import type { ClubLeague } from './club';

export type ReliabilityLevel = 'official' | 'tier_1' | 'tier_2' | 'trusted';

export interface Journalist {
  id: string;
  displayName: string;
  normalisedNames: string[];
  profileUrl: string | null;
  supportedLeagues: ClubLeague[];
  reliabilityTier: Exclude<ReliabilityLevel, 'official'>;
  enabled: boolean;
}

export interface TrustedSource {
  id: string;
  name: string;
  type: 'official' | 'journalist' | 'publisher';
  domain?: string;
  reliabilityTier: ReliabilityLevel;
  reliabilityScore: number;
  specialistClubs: string[];
  specialistLeagues: string[];
  profileUrl?: string;
  verificationMethod: string;
  active: boolean;
  lastReviewedAt: string;
  journalistNames?: string[];
  displayName?: string;
  enabled?: boolean;
}

export interface ReliabilityExplanation {
  score: number;
  tier: ReliabilityLevel;
  explanation: string[];
}