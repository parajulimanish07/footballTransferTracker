import type { TransferStatus } from '@/types/news';

const officialWords = [
  'signs',
  'signed',
  'joins',
  'joined',
  'completes',
  'completed',
  'announces',
  'announcement',
  'official',
  'transfers to',
  'completed a move',
  'has completed',
  'seal move',
  'seals move',
  'done deal',
  'agree new deal',
  'agreed new deal',
  'agrees new deal',
  'agree a new deal',
  'agree new six-year deal',
  'agree new contract',
  'signs new deal',
  'signed new deal',
  'new long-term deal',
  'contract extension',
  'extends contract',
];

const agreementWords = [
  'agreement reached',
  'deal agreed',
  'here we go',
  'agreed terms',
  'set to join',
  'agrees to join',
  'agree deal',
  'personal terms agreed',
  'agree new',
  'agreed new',
  'agrees new',
  'agree a new',
  'agreed a new',
  'reaches agreement',
  'reach agreement',
];

const advancedTalksWords = ['final stages', 'advanced talks', 'advanced negotiations', 'closing in on', 'nearing move'];
const negotiationWords = ['in talks', 'negotiating', 'negotiations', 'talks with', 'in discussions'];
const bidWords = ['bid submitted', 'offer made', 'bid rejected', 'submitted bid', 'makes bid', 'bids for', 'bid lodged', 'tabled bid', 'formal offer'];
const approachWords = ['contacted', 'approached', 'approach made', 'make an approach', 'inquiry made'];
const interestWords = ['interested', 'monitoring', 'considering', 'target', 'chasing', 'linked', 'keen on', 'move for', 'close to', 'consider a move', 'weighs move', 'decision to make', 'eyeing', 'pursuing', 'gossip', 'rumour', 'rumor', 'paper talk'];
const departureWords = ['departure expected', 'expected to leave', 'set to depart', 'nearing exit', 'leaving club'];

const transferKeywords = [
  'sign',
  'signing',
  'signed',
  'bid',
  'offer',
  'transfer',
  'deal',
  'target',
  'chasing',
  'interest',
  'interested',
  'contract',
  'release clause',
  'join',
  'joins',
  'joined',
  'leave',
  'leaving',
  'move to',
  'move for',
  'sell',
  'buy',
  'loan',
  'here we go',
  'gossip',
  'paper talk',
  'roundup',
  'round-up',
  'rumour',
  'rumor',
  'agreed',
  'negotiation',
  'negotiating',
  'in talks',
  'talks',
  'approach',
  'decision to make',
  'good fit at',
];

const nonTransferKeywords = [
  'died',
  'death',
  'collapsed',
  'passed away',
  'funeral',
  'tribute',
  'disciplinary',
  'proceedings',
  'fifa president',
  'investigation',
  'court',
  'police',
  'banned',
  'suspension',
  'match report',
  'player ratings',
  'guess premier league star',
  'who am i',
  'quiz',
  'trivia',
  'historical',
  'retires',
  'retired',
  'injury update',
  'injury news',
  'press conference',
  'season review',
  'national football teams day',
  'world cup final loss',
  'apologises for errors',
  'private investment plans',
  'healing from',
  'revolution',
  'gut feeling to join',
  'scars',
  'past career',
  'exciting opportunity',
];

export function isTransferNews(headline: string, summary: string): boolean {
  const text = `${headline} ${summary}`.toLowerCase();

  // Non-transfer subjects (tragedy, governance, disciplinary, match reviews, trivia)
  if (nonTransferKeywords.some((word) => text.includes(word))) {
    const activeTransferVerbs = ['bid', 'offer', 'gossip', 'paper talk', 'rumour', 'rumor', 'here we go', 'make an approach', 'transfers to'];
    if (!activeTransferVerbs.some((v) => text.includes(v))) {
      return false;
    }
  }

  // Must contain at least one positive transfer indicator keyword
  return transferKeywords.some((word) => text.includes(word));
}

export function classifyTransferStatus(headline: string, summary: string, isOfficial: boolean): TransferStatus {
  const text = `${headline} ${summary}`.toLowerCase();

  if (!isTransferNews(headline, summary) && !isOfficial) {
    return 'not_transfer_news';
  }

  if (officialWords.some((word) => text.includes(word))) return 'official';
  if (agreementWords.some((word) => text.includes(word))) return 'agreement_reached';
  if (advancedTalksWords.some((word) => text.includes(word))) return 'advanced_talks';
  if (negotiationWords.some((word) => text.includes(word))) return 'negotiations';
  if (bidWords.some((word) => text.includes(word))) return 'bid_submitted';
  if (approachWords.some((word) => text.includes(word))) return 'approach_made';
  if (departureWords.some((word) => text.includes(word))) return 'departure_expected';
  if (interestWords.some((word) => text.includes(word))) return 'interest';

  return isOfficial ? 'official' : 'interest';
}

export function formatTransferStatus(status: TransferStatus) {
  return {
    official: 'Official',
    agreement_reached: 'Agreement reached',
    advanced_talks: 'Advanced talks',
    negotiations: 'Negotiations ongoing',
    bid_submitted: 'Bid submitted',
    approach_made: 'Approach made',
    interest: 'Interest reported',
    departure_expected: 'Departure expected',
    not_transfer_news: 'Not Transfer News',
  }[status];
}