import type { TransferStatus } from '@/types/news';

const officialWords = ['signs', 'signed', 'completed', 'announces', 'announcement', 'official'];
const agreementWords = ['agreement reached', 'deal agreed', 'here we go'];
const advancedTalksWords = ['final stages', 'advanced talks', 'advanced negotiations'];
const negotiationWords = ['in talks', 'negotiating', 'negotiations'];
const bidWords = ['bid submitted', 'offer made', 'bid rejected'];
const approachWords = ['contacted', 'approached', 'approach made'];
const interestWords = ['interested', 'monitoring', 'considering'];
const departureWords = ['departure expected', 'expected to leave'];

export function classifyTransferStatus(headline: string, summary: string, isOfficial: boolean): TransferStatus {
  const text = `${headline} ${summary}`.toLowerCase();

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
  }[status];
}