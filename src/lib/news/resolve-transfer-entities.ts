import { clubs } from '@/config/clubs';
import type { ClubSummary } from '@/types/club';

export interface ResolvedEntities {
  playerName: string | null;
  currentClub: ClubSummary | null;
  destinationClub: ClubSummary | null;
  relatedClubIds: string[];
  isRoundup: boolean;
}

const KNOWN_PLAYERS = [
  'Rodri',
  'Declan Rice',
  'Riccardo Calafiori',
  'Darwin Nunez',
  'Darwin Núñez',
  'Kylian Mbappe',
  'Kylian Mbappé',
  'Joshua Zirkzee',
  'Victor Osimhen',
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
  'Pedro Neto',
  'Mikel Merino',
  'Alexander Isak',
  'Bruno Guimaraes',
];

/**
 * Sentence-level entity resolver that accurately associates players with their CURRENT club and DESTINATION club.
 * Prevents multi-rumor roundups (e.g., "Thursday's gossip") from falsely mixing teams across different sentences.
 */
export function resolveTransferEntities(headline: string, summary: string): ResolvedEntities {
  const fullText = `${headline} ${summary}`;
  const isRoundup = /gossip|paper talk|round-up|roundup|rumour mill|media watch|latest news/i.test(headline);

  // 1. Identify primary player (prioritize player mentioned in headline)
  let primaryPlayer = KNOWN_PLAYERS.find((p) => headline.toLowerCase().includes(p.toLowerCase()));
  if (!primaryPlayer) {
    primaryPlayer = KNOWN_PLAYERS.find((p) => summary.toLowerCase().includes(p.toLowerCase()));
  }

  // 2. Extract summary sentences containing the primary player
  const summarySentences = summary.split(/(?<=[.!?])\s+/).filter(Boolean);
  const playerSentence = primaryPlayer
    ? summarySentences.find((s) => s.toLowerCase().includes(primaryPlayer!.toLowerCase())) || headline
    : headline;

  let currentClub: ClubSummary | null = null;
  let destinationClub: ClubSummary | null = null;

  // 3. Find possessive origin club in player's sentence or summary (e.g. "Manchester City's Rodri", "Liverpool's Curtis Jones")
  const textToScan = `${playerSentence} ${summary}`;

  clubs.forEach((club) => {
    if (currentClub) return;
    const aliases = club.aliases.map((a) => a.toLowerCase());

    aliases.forEach((alias) => {
      if (currentClub) return;
      // Pattern: "Manchester City's Rodri" or "Manchester City midfielder Rodri"
      const possessiveRegex = new RegExp(
        `\\b${escapeRegExp(alias)}('s|\\s+(midfielder|defender|forward|striker|winger|player|star))\\s+${primaryPlayer ? escapeRegExp(primaryPlayer) : '[a-z]+'}`,
        'i'
      );

      if (possessiveRegex.test(textToScan) || textToScan.toLowerCase().includes(`${alias}'s`)) {
        currentClub = {
          id: club.id,
          name: club.name,
          slug: club.slug,
          league: club.league,
          crestUrl: club.crestUrl,
        };
      }
    });
  });

  // 4. Find target destination club (e.g. "Real Madrid confident of deal", "Inter Milan move for", "Aston Villa bid for")
  clubs.forEach((club) => {
    if (destinationClub) return;
    if (currentClub && club.id === currentClub.id) return;

    const aliases = club.aliases.map((a) => a.toLowerCase());

    aliases.forEach((alias) => {
      if (destinationClub) return;
      const destinationRegex = new RegExp(
        `\\b${escapeRegExp(alias)}\\s+(confident|agree|bidding|bid|chasing|seek|target|want|monitoring|sign|move for|close to|linked)`,
        'i'
      );

      if (destinationRegex.test(fullText.toLowerCase())) {
        destinationClub = {
          id: club.id,
          name: club.name,
          slug: club.slug,
          league: club.league,
          crestUrl: club.crestUrl,
        };
      }
    });
  });

  // Fallback: If no possessive/target pattern matched and it's NOT a multi-gossip roundup, pick matched clubs
  if (!isRoundup) {
    const matchedAll = clubs.filter((c) =>
      c.aliases.some((alias) => fullText.toLowerCase().includes(alias.toLowerCase()))
    );

    if (!currentClub && matchedAll[0]) {
      currentClub = {
        id: matchedAll[0].id,
        name: matchedAll[0].name,
        slug: matchedAll[0].slug,
        league: matchedAll[0].league,
        crestUrl: matchedAll[0].crestUrl,
      };
    }

    if (!destinationClub && matchedAll[1] && matchedAll[1].id !== currentClub?.id) {
      destinationClub = {
        id: matchedAll[1].id,
        name: matchedAll[1].name,
        slug: matchedAll[1].slug,
        league: matchedAll[1].league,
        crestUrl: matchedAll[1].crestUrl,
      };
    }
  }

  const relatedClubIds = Array.from(
    new Set(
      clubs
        .filter((c) => c.aliases.some((alias) => fullText.toLowerCase().includes(alias.toLowerCase())))
        .map((c) => c.id)
    )
  );

  return {
    playerName: primaryPlayer || null,
    currentClub,
    destinationClub,
    relatedClubIds,
    isRoundup,
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
