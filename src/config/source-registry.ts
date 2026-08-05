export interface SourceRegistryEntry {
  id: string;
  displayName: string;
  sourceType: 'publisher' | 'journalist' | 'official-club' | 'league' | 'social-account';
  domain: string | null;
  socialHandle: string | null;
  socialPlatformUserId: string | null;
  reliabilityTier: 'official' | 'tier_1' | 'tier_2' | 'trusted';
  baseReliabilityScore: number;
  specialistClubIds: string[];
  specialistLeagueIds: string[];
  enabled: boolean;
  lastReviewedAt: string;
  verificationNotes: string;
}

export const sourceRegistry: SourceRegistryEntry[] = [
  {
    id: 'bbc-sport',
    displayName: 'BBC Sport',
    sourceType: 'publisher',
    domain: 'bbc.com',
    socialHandle: '@BBCSport',
    socialPlatformUserId: null,
    reliabilityTier: 'tier_1',
    baseReliabilityScore: 92,
    specialistClubIds: [],
    specialistLeagueIds: ['premier-league'],
    enabled: true,
    lastReviewedAt: '2026-08-01',
    verificationNotes: 'Verified national public broadcaster with rigorous editorial verification.',
  },
  {
    id: 'the-guardian',
    displayName: 'The Guardian',
    sourceType: 'publisher',
    domain: 'theguardian.com',
    socialHandle: '@guardian_sport',
    socialPlatformUserId: null,
    reliabilityTier: 'tier_1',
    baseReliabilityScore: 90,
    specialistClubIds: [],
    specialistLeagueIds: ['premier-league', 'la-liga'],
    enabled: true,
    lastReviewedAt: '2026-08-01',
    verificationNotes: 'Verified British daily newspaper with dedicated sports investigative desk.',
  },
  {
    id: 'fabrizio-romano',
    displayName: 'Fabrizio Romano',
    sourceType: 'journalist',
    domain: null,
    socialHandle: 'FabrizioRomano',
    socialPlatformUserId: '14750953',
    reliabilityTier: 'tier_1',
    baseReliabilityScore: 95,
    specialistClubIds: [],
    specialistLeagueIds: ['premier-league', 'la-liga', 'serie-a'],
    enabled: true,
    lastReviewedAt: '2026-08-01',
    verificationNotes: 'Premier global transfer insider with direct agent and club executive contacts.',
  },
  {
    id: 'david-ornstein',
    displayName: 'David Ornstein',
    sourceType: 'journalist',
    domain: null,
    socialHandle: 'David_Ornstein',
    socialPlatformUserId: '19795744',
    reliabilityTier: 'tier_1',
    baseReliabilityScore: 96,
    specialistClubIds: ['arsenal', 'chelsea', 'manchester-united', 'liverpool'],
    specialistLeagueIds: ['premier-league'],
    enabled: true,
    lastReviewedAt: '2026-08-01',
    verificationNotes: 'Top-tier English football insider specializing in Premier League contract negotiations.',
  },
  {
    id: 'gianluca-dimarzio',
    displayName: 'Gianluca Di Marzio',
    sourceType: 'journalist',
    domain: 'dimarzio.com',
    socialHandle: 'DiMarzio',
    socialPlatformUserId: '88720102',
    reliabilityTier: 'tier_1',
    baseReliabilityScore: 88,
    specialistClubIds: ['inter', 'napoli', 'juventus'],
    specialistLeagueIds: ['serie-a'],
    enabled: true,
    lastReviewedAt: '2026-08-01',
    verificationNotes: 'Sky Italia chief transfer expert specializing in Serie A transfers.',
  },
  {
    id: 'florian-plettenberg',
    displayName: 'Florian Plettenberg',
    sourceType: 'journalist',
    domain: null,
    socialHandle: 'Plettigoal',
    socialPlatformUserId: '128859183',
    reliabilityTier: 'tier_1',
    baseReliabilityScore: 89,
    specialistClubIds: ['bayern-munich'],
    specialistLeagueIds: ['bundesliga'],
    enabled: true,
    lastReviewedAt: '2026-08-01',
    verificationNotes: 'Sky Germany insider covering Bundesliga transfers.',
  },
  {
    id: 'official-liverpool',
    displayName: 'Liverpool FC Official',
    sourceType: 'official-club',
    domain: 'liverpoolfc.com',
    socialHandle: 'LFC',
    socialPlatformUserId: '19583545',
    reliabilityTier: 'official',
    baseReliabilityScore: 100,
    specialistClubIds: ['liverpool'],
    specialistLeagueIds: ['premier-league'],
    enabled: true,
    lastReviewedAt: '2026-08-01',
    verificationNotes: 'Official club media channel.',
  },
  {
    id: 'official-real-madrid',
    displayName: 'Real Madrid C.F. Official',
    sourceType: 'official-club',
    domain: 'realmadrid.com',
    socialHandle: 'realmadrid',
    socialPlatformUserId: '14872237',
    reliabilityTier: 'official',
    baseReliabilityScore: 100,
    specialistClubIds: ['real-madrid'],
    specialistLeagueIds: ['la-liga'],
    enabled: true,
    lastReviewedAt: '2026-08-01',
    verificationNotes: 'Official club media channel.',
  },
];

export function getSourceByDomain(domain: string): SourceRegistryEntry | null {
  const d = domain.toLowerCase();
  return sourceRegistry.find((s) => s.domain && d.includes(s.domain.toLowerCase())) ?? null;
}

export function getSourceBySocialHandle(handle: string): SourceRegistryEntry | null {
  const h = handle.toLowerCase().replace('@', '');
  return sourceRegistry.find((s) => s.socialHandle && s.socialHandle.toLowerCase().replace('@', '') === h) ?? null;
}
