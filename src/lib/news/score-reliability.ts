import type { ReliabilityLevel } from '@/types/source';

export function scoreReliability(sourceTier: ReliabilityLevel, journalistName: string | null, isOfficial: boolean): ReliabilityLevel {
  if (isOfficial) return 'official';
  if (sourceTier === 'tier_1') return 'tier_1';
  if (journalistName) return sourceTier;
  return 'trusted';
}

export function reliabilityRank(level: ReliabilityLevel) {
  return {
    official: 4,
    tier_1: 3,
    tier_2: 2,
    trusted: 1,
  }[level];
}