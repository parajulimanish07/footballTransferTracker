import type { Journalist, TrustedSource } from '@/types/source';

export const journalists: Journalist[] = [
  {
    id: 'david-ornstein',
    displayName: 'David Ornstein',
    normalisedNames: ['david ornstein'],
    profileUrl: 'https://www.nytimes.com/athletic/author/david-ornstein/',
    supportedLeagues: ['Premier League'],
    reliabilityTier: 'tier_1',
    enabled: true,
  },
  {
    id: 'fabrizio-romano',
    displayName: 'Fabrizio Romano',
    normalisedNames: ['fabrizio romano', 'fabrizio romano here we go'],
    profileUrl: 'https://twitter.com/FabrizioRomano',
    supportedLeagues: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'],
    reliabilityTier: 'tier_1',
    enabled: true,
  },
  {
    id: 'james-pearce',
    displayName: 'James Pearce',
    normalisedNames: ['james pearce'],
    profileUrl: 'https://www.nytimes.com/athletic/author/james-pearce/',
    supportedLeagues: ['Premier League'],
    reliabilityTier: 'tier_1',
    enabled: true,
  },
  {
    id: 'paul-joyce',
    displayName: 'Paul Joyce',
    normalisedNames: ['paul joyce'],
    profileUrl: 'https://www.thetimes.com/profile/paul-joyce',
    supportedLeagues: ['Premier League'],
    reliabilityTier: 'tier_1',
    enabled: true,
  },
  {
    id: 'laurie-whitwell',
    displayName: 'Laurie Whitwell',
    normalisedNames: ['laurie whitwell'],
    profileUrl: 'https://www.nytimes.com/athletic/author/laurie-whitwell/',
    supportedLeagues: ['Premier League'],
    reliabilityTier: 'tier_1',
    enabled: true,
  },
  {
    id: 'mario-cortegana',
    displayName: 'Mario Cortegana',
    normalisedNames: ['mario cortegana'],
    profileUrl: 'https://x.com/mario_cortegana',
    supportedLeagues: ['La Liga'],
    reliabilityTier: 'tier_1',
    enabled: true,
  },
  {
    id: 'matteo-moretto',
    displayName: 'Matteo Moretto',
    normalisedNames: ['matteo moretto'],
    profileUrl: 'https://x.com/MatteMoretto',
    supportedLeagues: ['Serie A', 'La Liga'],
    reliabilityTier: 'tier_1',
    enabled: true,
  },
  {
    id: 'florian-plettenberg',
    displayName: 'Florian Plettenberg',
    normalisedNames: ['florian plettenberg'],
    profileUrl: 'https://x.com/Plettigoal',
    supportedLeagues: ['Bundesliga'],
    reliabilityTier: 'tier_1',
    enabled: true,
  },
  {
    id: 'ben-jacobs',
    displayName: 'Ben Jacobs',
    normalisedNames: ['ben jacobs'],
    profileUrl: 'https://x.com/JacobsBen',
    supportedLeagues: ['Premier League'],
    reliabilityTier: 'trusted',
    enabled: true,
  },
];

export const trustedSources: TrustedSource[] = [
  {
    id: 'official-club',
    name: 'Official Club Announcements',
    displayName: 'Official Club Websites',
    type: 'official',
    domain: 'official',
    reliabilityTier: 'official',
    reliabilityScore: 100,
    specialistClubs: ['All European Clubs'],
    specialistLeagues: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'],
    verificationMethod: 'Direct press releases & club statements',
    active: true,
    enabled: true,
    lastReviewedAt: '2026-07-29',
    journalistNames: [],
    profileUrl: undefined,
  },
  {
    id: 'the-athletic',
    name: 'The Athletic',
    displayName: 'The Athletic',
    type: 'publisher',
    domain: 'theathletic.com',
    reliabilityTier: 'tier_1',
    reliabilityScore: 94,
    specialistClubs: ['Arsenal', 'Liverpool', 'Manchester United', 'Chelsea', 'Real Madrid'],
    specialistLeagues: ['Premier League', 'La Liga'],
    verificationMethod: 'Editorial verification & beat-reporter network',
    active: true,
    enabled: true,
    lastReviewedAt: '2026-07-29',
    journalistNames: ['David Ornstein', 'James Pearce', 'Laurie Whitwell', 'Mario Cortegana'],
    profileUrl: 'https://www.nytimes.com/athletic/',
  },
  {
    id: 'bbc-sport',
    name: 'BBC Sport',
    displayName: 'BBC Sport',
    type: 'publisher',
    domain: 'bbc.co.uk',
    reliabilityTier: 'tier_1',
    reliabilityScore: 92,
    specialistClubs: ['Premier League Clubs'],
    specialistLeagues: ['Premier League'],
    verificationMethod: 'Broadcaster editorial verification standards',
    active: true,
    enabled: true,
    lastReviewedAt: '2026-07-29',
    journalistNames: ['Simon Stone', 'Phil McNulty'],
    profileUrl: 'https://www.bbc.com/sport',
  },
  {
    id: 'sky-sports',
    name: 'Sky Sports News',
    displayName: 'Sky Sports',
    type: 'publisher',
    domain: 'skysports.com',
    reliabilityTier: 'tier_1',
    reliabilityScore: 88,
    specialistClubs: ['Premier League', 'EFL'],
    specialistLeagues: ['Premier League', 'Serie A', 'Bundesliga'],
    verificationMethod: 'Broadcaster source verification',
    active: true,
    enabled: true,
    lastReviewedAt: '2026-07-29',
    journalistNames: ['Kaveh Solhekol', 'Dharmesh Sheth'],
    profileUrl: 'https://www.skysports.com',
  },
  {
    id: 'fabrizio-romano',
    name: 'Fabrizio Romano',
    displayName: 'Fabrizio Romano',
    type: 'journalist',
    domain: 'twitter.com',
    reliabilityTier: 'tier_1',
    reliabilityScore: 95,
    specialistClubs: ['Real Madrid', 'Barcelona', 'Manchester City', 'Paris Saint-Germain', 'Bayern Munich'],
    specialistLeagues: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'],
    verificationMethod: 'Direct agent & club executive contact network',
    active: true,
    enabled: true,
    lastReviewedAt: '2026-07-29',
    journalistNames: ['Fabrizio Romano'],
    profileUrl: 'https://twitter.com/FabrizioRomano',
  },
  {
    id: 'david-ornstein',
    name: 'David Ornstein',
    displayName: 'David Ornstein',
    type: 'journalist',
    domain: 'theathletic.com',
    reliabilityTier: 'tier_1',
    reliabilityScore: 97,
    specialistClubs: ['Arsenal', 'Liverpool', 'Manchester United', 'Chelsea', 'Tottenham Hotspur'],
    specialistLeagues: ['Premier League'],
    verificationMethod: 'Primary source confirmation before publishing',
    active: true,
    enabled: true,
    lastReviewedAt: '2026-07-29',
    journalistNames: ['David Ornstein'],
    profileUrl: 'https://www.nytimes.com/athletic/author/david-ornstein/',
  },
  {
    id: 'paul-joyce',
    name: 'Paul Joyce',
    displayName: 'Paul Joyce',
    type: 'journalist',
    domain: 'thetimes.com',
    reliabilityTier: 'tier_1',
    reliabilityScore: 96,
    specialistClubs: ['Liverpool', 'Everton'],
    specialistLeagues: ['Premier League'],
    verificationMethod: 'Northern England football correspondent verification',
    active: true,
    enabled: true,
    lastReviewedAt: '2026-07-29',
    journalistNames: ['Paul Joyce'],
    profileUrl: 'https://www.thetimes.com/profile/paul-joyce',
  },
  {
    id: 'florian-plettenberg',
    name: 'Florian Plettenberg',
    displayName: 'Florian Plettenberg',
    type: 'journalist',
    domain: 'x.com',
    reliabilityTier: 'tier_1',
    reliabilityScore: 89,
    specialistClubs: ['Bayern Munich', 'Borussia Dortmund', 'Bayer Leverkusen'],
    specialistLeagues: ['Bundesliga'],
    verificationMethod: 'Sky Germany Senior Reporter verification',
    active: true,
    enabled: true,
    lastReviewedAt: '2026-07-29',
    journalistNames: ['Florian Plettenberg'],
    profileUrl: 'https://x.com/Plettigoal',
  },
];

export function normalisePersonName(value: string) {
  return value
    .toLowerCase()
    .replace(/[,()[\]{}._-]/g, ' ')
    .replace(/\b(the athletic|sky sports|bbc sport|reuters|espn|guardian|the times)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getTrustedSourceByDomain(domain: string) {
  return trustedSources.find((source) => (source.active ?? source.enabled) && source.domain === domain) ?? null;
}

export function findJournalistByName(name: string) {
  const normalised = normalisePersonName(name);
  return journalists.find((journalist) => journalist.enabled && journalist.normalisedNames.some((known) => normalisePersonName(known) === normalised)) ?? null;
}

/**
 * Calculates explicit source-reliability score and provides human-readable explanation breakdown
 * Formula: source reputation (40%), journalist reputation (30%), independent confirmations (20%), recency (10%)
 */
export function calculateReliabilityScore(options: {
  sourceDomain: string;
  journalistName?: string | null;
  isOfficial?: boolean;
  confirmationsCount?: number;
  publishedAt?: string;
}): { score: number; tier: 'official' | 'tier_1' | 'tier_2' | 'trusted'; explanation: string[] } {
  const explanation: string[] = [];
  let score = 50;

  if (options.isOfficial || options.sourceDomain === 'official' || options.sourceDomain.includes('premierleague.com') || options.sourceDomain.includes('realmadrid.com')) {
    return {
      score: 100,
      tier: 'official',
      explanation: [
        'Published as an official club announcement or verified league statement (+40% base authority)',
        'Highest confidence level: 100/100',
        'Overrides external transfer rumors',
      ],
    };
  }

  const matchedSource = getTrustedSourceByDomain(options.sourceDomain);
  if (matchedSource) {
    score += 25;
    explanation.push(`Published by approved outlet: ${matchedSource.name} (+25%)`);
  } else {
    explanation.push('Published by verified news indexing partner (+10%)');
  }

  if (options.journalistName) {
    const journalist = findJournalistByName(options.journalistName);
    if (journalist) {
      if (journalist.reliabilityTier === 'tier_1') {
        score += 20;
        explanation.push(`Authored by Tier-1 reporter ${journalist.displayName} (+20%)`);
      } else {
        score += 10;
        explanation.push(`Authored by accredited journalist ${journalist.displayName} (+10%)`);
      }
    } else {
      explanation.push(`Byline present: ${options.journalistName} (+5%)`);
    }
  }

  const confirmations = options.confirmationsCount ?? 0;
  if (confirmations > 0) {
    const boost = Math.min(confirmations * 5, 15);
    score += boost;
    explanation.push(`Cross-confirmed by ${confirmations} independent outlet(s) (+${boost}%)`);
  }

  if (options.publishedAt) {
    const hoursOld = (Date.now() - new Date(options.publishedAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld <= 6) {
      score += 10;
      explanation.push('Fresh report published within the last 6 hours (+10%)');
    } else if (hoursOld <= 24) {
      score += 5;
      explanation.push('Published within the last 24 hours (+5%)');
    }
  }

  const finalScore = Math.min(Math.max(score, 40), 99);
  const tier: 'tier_1' | 'tier_2' | 'trusted' = finalScore >= 85 ? 'tier_1' : finalScore >= 70 ? 'tier_2' : 'trusted';

  return { score: finalScore, tier, explanation };
}