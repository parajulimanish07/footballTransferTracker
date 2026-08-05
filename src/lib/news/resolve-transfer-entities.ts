import { clubs } from '@/config/clubs';
import type { ClubSummary } from '@/types/club';
import { classifyTransferStatus } from './classify-transfer-status';
import type { TransferStatus } from '@/types/news';

export interface TransferClaim {
  claimText: string;
  playerName: string | null;
  currentClubId: string | null;
  destinationClubId: string | null;
  interestedClubId: string | null;
  transferStatus: TransferStatus | null;
  confidence: number;
}

export interface ResolvedEntities {
  playerName: string | null;
  currentClub: ClubSummary | null;
  destinationClub: ClubSummary | null;
  relatedClubIds: string[];
  isRoundup: boolean;
  confidence: 'high' | 'medium' | 'low';
  claims: TransferClaim[];
}

const KNOWN_PLAYERS = [
  'Mohamed Salah',
  'Benjamin Sesko',
  'Benjamin Šeško',
  'Pedro Neto',
  'Victor Osimhen',
  'Jack Grealish',
  'Cody Gakpo',
  'Josko Gvardiol',
  'Joško Gvardiol',
  'Gvardiol',
  'Victor Gyökeres',
  'Viktor Gyökeres',
  'Ivan Toney',
  'Federico Chiesa',
  'Jadon Sancho',
  'Kingsley Coman',
  'Nico Williams',
  'Manuel Ugarte',
  'Eberechi Eze',
  'Rodri',
  'Declan Rice',
  'Riccardo Calafiori',
  'Darwin Nunez',
  'Darwin Núñez',
  'Kylian Mbappe',
  'Kylian Mbappé',
  'Joshua Zirkzee',
  'Moises Caicedo',
  'Moisés Caicedo',
  'Leny Yoro',
  'Teun Koopmeiners',
  'Luis Diaz',
  'Luis Díaz',
  'Curtis Jones',
  'Allan',
  'Aaron Ramsdale',
  'Marc Guehi',
  'Marc Guéhi',
  'Mikel Merino',
  'Alexander Isak',
  'Bruno Guimaraes',
];

const KNOWN_PLAYER_ORIGIN_CLUBS: Record<string, string> = {
  'mohamed salah': 'liverpool',
  'bruno guimaraes': 'newcastle-united',
  'victor osimhen': 'napoli',
  'jack grealish': 'manchester-city',
  'cody gakpo': 'liverpool',
  'josko gvardiol': 'manchester-city',
  'joško gvardiol': 'manchester-city',
  'victor gyökeres': 'sporting-cp',
  'viktor gyökeres': 'sporting-cp',
  'ivan toney': 'brentford',
  'jadon sancho': 'manchester-united',
  'nico williams': 'athletic-bilbao',
  'eberechi eze': 'crystal-palace',
  'rodri': 'manchester-city',
  'declan rice': 'arsenal',
  'riccardo calafiori': 'arsenal',
  'darwin nunez': 'liverpool',
  'darwin Núñez': 'liverpool',
  'kylian mbappe': 'real-madrid',
  'kylian mbappé': 'real-madrid',
  'joshua zirkzee': 'manchester-united',
  'luis diaz': 'liverpool',
  'luis díaz': 'liverpool',
  'curtis jones': 'liverpool',
  'aaron ramsdale': 'southampton',
  'marc guehi': 'crystal-palace',
  'mikel merino': 'arsenal',
};

const STOP_WORDS_TRAILING = new Set([
  'is',
  'has',
  'was',
  'are',
  'were',
  'to',
  'for',
  'in',
  'on',
  'at',
  'from',
  'with',
  'and',
  'or',
  'says',
  'said',
]);

// Flattened list of all club aliases sorted by length descending so longer names (e.g. Atletico Madrid) take precedence over short sub-aliases (e.g. Madrid)
const SORTED_CLUB_ALIASES = clubs
  .flatMap((club) => club.aliases.map((alias) => ({ clubId: club.id, alias })))
  .sort((a, b) => b.alias.length - a.alias.length);

/**
 * Splits multi-rumour articles into independent transfer claims.
 * Ensures player, current club, destination club, and transfer status are extracted strictly per clause.
 */
export function extractTransferClaims(headline: string, summary: string): TransferClaim[] {
  const fullText = summary && summary.length > 15 ? `${headline}. ${summary}` : headline;

  // Split text by sentence boundaries, semicolons, commas separating clauses, and transition phrases
  const rawClauses = fullText
    .split(/(?<=[.!?])\s+|;\s*|,\s*(?=[A-Z])|\s+meanwhile\s+|\s+and\s+elsewhere\s+|\s+also\s+|\s+plus\s+|\s+while\s+|\s+and\s+(?=[A-Z])/i)
    .map((c) => c.trim())
    .filter((c) => c.length > 10);

  const claims: TransferClaim[] = [];

  for (const clauseText of rawClauses) {
    const player = extractPlayerNameFromText(clauseText);
    const originClubId = extractOriginClubIdFromText(clauseText, player);
    const destClubId = extractDestinationClubIdFromText(clauseText, originClubId);

    // If no explicit transfer player or club evidence in this clause, skip it
    if (!player && !originClubId && !destClubId) {
      continue;
    }

    const status = classifyTransferStatus(clauseText, clauseText, false);

    let confidence = 0.5;
    if (player && (originClubId || destClubId)) {
      confidence = originClubId && destClubId ? 1.0 : 0.8;
    }

    claims.push({
      claimText: clauseText,
      playerName: player,
      currentClubId: originClubId,
      destinationClubId: destClubId,
      interestedClubId: destClubId,
      transferStatus: status,
      confidence,
    });
  }

  // Deduplicate and merge claims for the same player across headline and summary clauses
  const mergedClaims: TransferClaim[] = [];
  for (const claim of claims) {
    if (!claim.playerName) {
      mergedClaims.push(claim);
      continue;
    }
    const existing = mergedClaims.find(
      (c) => c.playerName && c.playerName.toLowerCase() === claim.playerName!.toLowerCase()
    );
    if (existing) {
      if (!existing.currentClubId && claim.currentClubId) existing.currentClubId = claim.currentClubId;
      if (!existing.destinationClubId && claim.destinationClubId) existing.destinationClubId = claim.destinationClubId;
      if (!existing.interestedClubId && claim.interestedClubId) existing.interestedClubId = claim.interestedClubId;
      existing.confidence = Math.max(existing.confidence, claim.confidence);
    } else {
      mergedClaims.push(claim);
    }
  }

  return mergedClaims;
}

/**
 * Advanced entity resolver that associates players and clubs using sentence-isolated transfer claims.
 */
export function resolveTransferEntities(
  headline: string,
  summary: string,
  targetClubId?: string | null
): ResolvedEntities {
  const isRoundup = /gossip|paper talk|round-up|roundup|rumour mill|media watch|latest news/i.test(headline);
  const claims = extractTransferClaims(headline, summary);

  // If a target club context is provided, select the specific claim mentioning that target club
  let selectedClaim: TransferClaim | null = null;

  if (targetClubId) {
    selectedClaim =
      claims.find(
        (c) =>
          c.destinationClubId === targetClubId ||
          c.interestedClubId === targetClubId ||
          c.currentClubId === targetClubId
      ) || null;
  }

  if (!selectedClaim && claims.length > 0) {
    selectedClaim = claims[0];
  }

  let primaryPlayer = selectedClaim?.playerName || extractPlayerNameFromText(`${headline} ${summary}`);
  let currentClubSummary: ClubSummary | null = null;
  let destinationClubSummary: ClubSummary | null = null;

  if (selectedClaim?.currentClubId) {
    const found = clubs.find((c) => c.id === selectedClaim!.currentClubId);
    if (found) {
      currentClubSummary = { id: found.id, name: found.name, slug: found.slug, league: found.league, crestUrl: found.crestUrl };
    }
  }

  if (selectedClaim?.destinationClubId) {
    const found = clubs.find((c) => c.id === selectedClaim!.destinationClubId);
    if (found) {
      destinationClubSummary = { id: found.id, name: found.name, slug: found.slug, league: found.league, crestUrl: found.crestUrl };
    }
  }

  // Strict Validation: currentClub and destinationClub must NEVER be identical
  if (currentClubSummary && destinationClubSummary && currentClubSummary.id === destinationClubSummary.id) {
    destinationClubSummary = null;
  }

  // Calculate overall confidence score
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (primaryPlayer && (currentClubSummary || destinationClubSummary)) {
    confidence = currentClubSummary && destinationClubSummary ? 'high' : 'medium';
  }

  // All related clubs mentioned across valid claims
  const relatedClubIds = Array.from(
    new Set(
      claims
        .flatMap((c) => [c.currentClubId, c.destinationClubId, c.interestedClubId])
        .filter(Boolean) as string[]
    )
  );

  return {
    playerName: primaryPlayer || null,
    currentClub: currentClubSummary,
    destinationClub: destinationClubSummary,
    relatedClubIds,
    isRoundup,
    confidence,
    claims,
  };
}

function extractPlayerNameFromText(text: string): string | null {
  let matched = KNOWN_PLAYERS.find((p) => text.toLowerCase().includes(p.toLowerCase()));
  if (matched) return cleanPlayerName(matched);

  const roleRegex = /(?:striker|winger|midfielder|defender|forward|star|player|target)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i;
  const roleMatch = text.match(roleRegex);
  if (roleMatch && roleMatch[1]) {
    return cleanPlayerName(roleMatch[1]);
  }

  return null;
}

function extractOriginClubIdFromText(text: string, playerName: string | null): string | null {
  let foundId: string | null = null;

  for (const { clubId, alias } of SORTED_CLUB_ALIASES) {
    if (foundId) break;

    const possessivePattern = playerName
      ? `\\b${escapeRegExp(alias)}('s|\\s+(striker|winger|midfielder|defender|forward|player|star|captain))\\s+(?:[a-z]+\\s+)*${escapeRegExp(playerName)}`
      : `\\b${escapeRegExp(alias)}('s|\\s+(striker|winger|midfielder|defender|forward|player|star|captain))`;

    const possessiveRegex = new RegExp(possessivePattern, 'i');
    if (possessiveRegex.test(text) || (playerName && text.toLowerCase().includes(`${alias.toLowerCase()}'s ${playerName.toLowerCase()}`))) {
      foundId = clubId;
    }
  }

  if (!foundId && playerName) {
    foundId = KNOWN_PLAYER_ORIGIN_CLUBS[playerName.toLowerCase()] || null;
  }

  return foundId;
}

function extractDestinationClubIdFromText(text: string, originClubId: string | null): string | null {
  let foundId: string | null = null;

  for (const { clubId, alias } of SORTED_CLUB_ALIASES) {
    if (foundId || (originClubId && clubId === originClubId)) continue;

    const destPattern1 = `\\b${escapeRegExp(alias)}(?:\\s+[a-z"']+)*\\s+(keen|confident|agree|bidding|bid|chasing|seek|target|want|wants|monitoring|sign|signing|move for|close to|linked|interested|proposal|work with|consider a move|talks with|make an approach)`;
    const destPattern2 = `(move to|close to|linked with|sign for|join|switch to|target for|move for|keen on|work with|approach for|approach to|interested in|proposal to|target|talks with|consider a move for|make an approach for)\\s+(?:[a-z"']+\\s+)*${escapeRegExp(alias)}`;
    const destinationRegex = new RegExp(`(${destPattern1}|${destPattern2})`, 'i');

    if (destinationRegex.test(text.toLowerCase())) {
      foundId = clubId;
    }
  }

  return foundId;
}

function cleanPlayerName(name: string): string {
  const parts = name.trim().split(/\s+/);
  while (parts.length > 1 && STOP_WORDS_TRAILING.has(parts[parts.length - 1].toLowerCase())) {
    parts.pop();
  }
  return parts.join(' ');
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
