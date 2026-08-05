import type { TransferStatus } from '@/types/news';
import { clubs } from '@/config/clubs';
import { leagues } from '@/config/leagues';

export interface TransferSearchIntent {
  questionType:
    | 'LATEST_UPDATE'
    | 'CONFIRMATION_CHECK'
    | 'REPORTED_FEE'
    | 'TRANSFER_TIMELINE'
    | 'CLUB_TARGETS'
    | 'PLAYER_DESTINATIONS'
    | 'SOURCE_COMPARISON'
    | 'GENERAL_SEARCH';
  playerName: string | null;
  clubIds: string[];
  leagueIds: string[];
  requestedStatuses: TransferStatus[];
  recencyWindowHours: number | null;
}

export function parseTransferSearchIntent(question: string): TransferSearchIntent {
  const q = question.toLowerCase();

  // 1. Identify question type
  let questionType: TransferSearchIntent['questionType'] = 'GENERAL_SEARCH';
  if (q.includes('timeline') || q.includes('history') || q.includes('progression')) {
    questionType = 'TRANSFER_TIMELINE';
  } else if (q.includes('fee') || q.includes('cost') || q.includes('price') || q.includes('how much')) {
    questionType = 'REPORTED_FEE';
  } else if (q.includes('official') || q.includes('confirmed') || q.includes('done deal')) {
    questionType = 'CONFIRMATION_CHECK';
  } else if (q.includes('target') || q.includes('signing') || q.includes('trying to sign') || q.includes('want')) {
    questionType = 'CLUB_TARGETS';
  } else if (q.includes('latest') || q.includes('update') || q.includes('recent')) {
    questionType = 'LATEST_UPDATE';
  }

  // 2. Identify Player Name
  let playerName: string | null = null;
  const knownPlayers = [
    'Victor Osimhen',
    'Jack Grealish',
    'Rodri',
    'Riccardo Calafiori',
    'Declan Rice',
    'Cody Gakpo',
    'Darwin Nunez',
    'Kylian Mbappe',
    'Joshua Zirkzee',
  ];

  for (const name of knownPlayers) {
    if (q.includes(name.toLowerCase())) {
      playerName = name;
      break;
    }
  }

  // 3. Identify Club IDs
  const clubIds: string[] = [];
  clubs.forEach((club) => {
    if (
      q.includes(club.name.toLowerCase()) ||
      club.aliases.some((alias) => q.includes(alias.toLowerCase()))
    ) {
      if (!clubIds.includes(club.id)) clubIds.push(club.id);
    }
  });

  // 4. Identify League IDs
  const leagueIds: string[] = [];
  leagues.forEach((league) => {
    if (q.includes(league.name.toLowerCase()) || q.includes(league.slug.toLowerCase())) {
      if (!leagueIds.includes(league.id)) leagueIds.push(league.id);
    }
  });

  // 5. Identify requested statuses
  const requestedStatuses: TransferStatus[] = [];
  if (q.includes('official') || q.includes('confirmed')) requestedStatuses.push('official');
  if (q.includes('bid') || q.includes('offer')) requestedStatuses.push('bid_submitted');
  if (q.includes('agreement') || q.includes('agreed')) requestedStatuses.push('agreement_reached');

  return {
    questionType,
    playerName,
    clubIds,
    leagueIds,
    requestedStatuses,
    recencyWindowHours: q.includes('today') ? 24 : null,
  };
}
