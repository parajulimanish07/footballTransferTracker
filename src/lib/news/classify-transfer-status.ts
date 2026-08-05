import type { TransferStatus } from '@/types/news';

const officialWords = ['signs', 'signed', 'completed', 'announces', 'announcement', 'official'];
const agreementWords = ['agreement reached', 'deal agreed', 'here we go'];
const advancedTalksWords = ['final stages', 'advanced talks', 'advanced negotiations'];
const negotiationWords = ['in talks', 'negotiating', 'negotiations', 'talks with'];
const bidWords = ['bid submitted', 'offer made', 'bid rejected'];
const approachWords = ['contacted', 'approached', 'approach made', 'make an approach'];
const interestWords = ['interested', 'monitoring', 'considering', 'target', 'chasing', 'linked', 'keen on', 'move for', 'close to', 'consider a move'];
const departureWords = ['departure expected', 'expected to leave'];

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
  'leave',
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
];

const nonTransferKeywords = [
  'match report',
  'tactics',
  'tactical',
  'historical',
  'retires',
  'retired',
  'injury update',
  'injury news',
  'press conference',
  'season review',
  'player ratings',
  'healing from',
  'revolution',
  'gut feeling to join',
  'exciting opportunity',
  'past career',
  'scars',
];

export function isTransferNews(headline: string, summary: string): boolean {
  const text = `${headline} ${summary}`.toLowerCase();

  // Retrospective/profile feature articles without active transfer action words are not transfer news
  if (nonTransferKeywords.some((word) => text.includes(word))) {
    // Only pass if there is an explicit active transfer claim verb like "bid", "offer", "gossip", "here we go"
    const activeTransferVerbs = ['bid', 'offer', 'gossip', 'paper talk', 'rumour', 'rumor', 'here we go', 'make an approach'];
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

  if (isOfficial && officialWords.some((word) => text.includes(word))) {
    return 'official';
  }
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