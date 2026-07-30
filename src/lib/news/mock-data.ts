import { clubs } from '@/config/clubs';
import { classifyTransferStatus } from './classify-transfer-status';
import { slugify } from '../utils';
import type { TransferNewsItem } from '@/types/news';

const liverpool = clubs.find((club) => club.id === 'liverpool')!;
const manUnited = clubs.find((club) => club.id === 'manchester-united')!;
const realMadrid = clubs.find((club) => club.id === 'real-madrid')!;
const bayern = clubs.find((club) => club.id === 'bayern-munich')!;
const psg = clubs.find((club) => club.id === 'psg')!;
const arsenal = clubs.find((club) => club.id === 'arsenal')!;

const now = Date.now();

function createItem(partial: Omit<TransferNewsItem, 'transferStatus' | 'reliability' | 'isOfficial' | 'duplicateGroupId'> & Partial<Pick<TransferNewsItem, 'transferStatus' | 'reliability' | 'isOfficial' | 'duplicateGroupId'>>) {
  const isOfficial = partial.isOfficial ?? false;
  const transferStatus = partial.transferStatus ?? classifyTransferStatus(partial.headline, partial.summary, isOfficial);
  return {
    ...partial,
    transferStatus,
    reliability: partial.reliability ?? (isOfficial ? 'official' : 'tier_1'),
    isOfficial,
    duplicateGroupId: partial.duplicateGroupId ?? null,
  } as TransferNewsItem;
}

export const mockNews: TransferNewsItem[] = [
  createItem({
    id: 'demo-liverpool-official-signing',
    headline: 'Liverpool officially announce the signing of a new forward',
    summary: 'Demonstration data: Liverpool confirm the arrival of a forward after the player signs a long-term contract.',
    playerName: 'Alex Mercer',
    playerImageUrl: null,
    currentClub: arsenal,
    destinationClub: liverpool,
    relatedClubIds: [liverpool.id, arsenal.id],
    direction: 'incoming',
    sourceName: 'Liverpool FC',
    sourceDomain: 'official',
    sourceUrl: 'https://www.liverpoolfc.com',
    journalistName: null,
    publishedAt: new Date(now - 1000 * 60 * 35).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 30).toISOString(),
    imageUrl: null,
    isOfficial: true,
    duplicateGroupId: 'liverpool-forward-signing',
  }),
  createItem({
    id: 'demo-liverpool-tier1-agreement',
    headline: 'Agreement reached for Liverpool midfield target',
    summary: 'David Ornstein reports that an agreement has been reached for the midfielder to join Liverpool.',
    playerName: 'Jules Navarro',
    playerImageUrl: null,
    currentClub: realMadrid,
    destinationClub: liverpool,
    relatedClubIds: [liverpool.id, realMadrid.id],
    direction: 'incoming',
    sourceName: 'The Athletic',
    sourceDomain: 'theathletic.com',
    sourceUrl: 'https://www.nytimes.com/athletic/',
    journalistName: 'David Ornstein',
    publishedAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    imageUrl: null,
    reliability: 'tier_1',
    duplicateGroupId: 'liverpool-midfield-target',
  }),
  createItem({
    id: 'demo-liverpool-bbc-duplicate',
    headline: 'Liverpool move for midfielder gathers pace after agreement talks',
    summary: 'BBC Sport reports the same Liverpool midfielder development with a short update from the same evening.',
    playerName: 'Jules Navarro',
    playerImageUrl: null,
    currentClub: realMadrid,
    destinationClub: liverpool,
    relatedClubIds: [liverpool.id, realMadrid.id],
    direction: 'incoming',
    sourceName: 'BBC Sport',
    sourceDomain: 'bbc.com',
    sourceUrl: 'https://www.bbc.com/sport',
    journalistName: 'Simon Stone',
    publishedAt: new Date(now - 1000 * 60 * 60 * 2 + 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 60 * 2 + 1000 * 60 * 15).toISOString(),
    imageUrl: null,
    reliability: 'trusted',
    duplicateGroupId: 'liverpool-midfield-target',
  }),
  createItem({
    id: 'demo-manunited-advanced-talks',
    headline: 'Manchester United in advanced talks for full-back',
    summary: 'Laurie Whitwell reports that Manchester United are in advanced talks for a defensive signing.',
    playerName: 'Tomás Adler',
    playerImageUrl: null,
    currentClub: bayern,
    destinationClub: manUnited,
    relatedClubIds: [manUnited.id, bayern.id],
    direction: 'incoming',
    sourceName: 'The Athletic',
    sourceDomain: 'theathletic.com',
    sourceUrl: 'https://www.nytimes.com/athletic/',
    journalistName: 'Laurie Whitwell',
    publishedAt: new Date(now - 1000 * 60 * 90).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 90).toISOString(),
    imageUrl: null,
    reliability: 'tier_1',
  }),
  createItem({
    id: 'demo-arsenal-bid-submitted',
    headline: 'Arsenal bid submitted for winger after fresh contact',
    summary: 'Trusted reporting says Arsenal have submitted a bid and remain in talks with the selling club.',
    playerName: 'Mikael Costa',
    playerImageUrl: null,
    currentClub: psg,
    destinationClub: arsenal,
    relatedClubIds: [arsenal.id, psg.id],
    direction: 'incoming',
    sourceName: 'Sky Sports',
    sourceDomain: 'skysports.com',
    sourceUrl: 'https://www.skysports.com',
    journalistName: 'Kaveh Solhekol',
    publishedAt: new Date(now - 1000 * 60 * 40).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 35).toISOString(),
    imageUrl: null,
    reliability: 'trusted',
  }),
  createItem({
    id: 'demo-real-madrid-departure-expected',
    headline: 'Departure expected as Real Madrid prepare summer reshuffle',
    summary: 'Mario Cortegana notes that one senior player is expected to leave as part of Real Madrid’s summer plans.',
    playerName: 'Iñaki Varela',
    playerImageUrl: null,
    currentClub: realMadrid,
    destinationClub: null,
    relatedClubIds: [realMadrid.id],
    direction: 'outgoing',
    sourceName: 'Marca',
    sourceDomain: 'marca.com',
    sourceUrl: 'https://www.marca.com',
    journalistName: 'Mario Cortegana',
    publishedAt: new Date(now - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 120).toISOString(),
    imageUrl: null,
    reliability: 'tier_1',
  }),
  createItem({
    id: 'demo-bayern-interest',
    headline: 'Bayern Munich monitoring centre-back situation',
    summary: 'Florian Plettenberg reports Bayern are interested and monitoring the situation, without talks yet.',
    playerName: 'Elias Novak',
    playerImageUrl: null,
    currentClub: psg,
    destinationClub: bayern,
    relatedClubIds: [bayern.id, psg.id],
    direction: 'incoming',
    sourceName: 'Sky Sport Germany',
    sourceDomain: 'skysport.de',
    sourceUrl: 'https://sport.sky.de',
    journalistName: 'Florian Plettenberg',
    publishedAt: new Date(now - 1000 * 60 * 20).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 20).toISOString(),
    imageUrl: null,
    reliability: 'tier_1',
  }),
  createItem({
    id: 'demo-psg-approach-made',
    headline: 'PSG have approached agent over creative midfielder',
    summary: 'The Guardian says Paris Saint-Germain have made an approach but no bid has followed yet.',
    playerName: 'Marco Bellini',
    playerImageUrl: null,
    currentClub: arsenal,
    destinationClub: psg,
    relatedClubIds: [psg.id, arsenal.id],
    direction: 'incoming',
    sourceName: 'The Guardian',
    sourceDomain: 'theguardian.com',
    sourceUrl: 'https://www.theguardian.com/football',
    journalistName: 'Jacob Steinberg',
    publishedAt: new Date(now - 1000 * 60 * 165).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 165).toISOString(),
    imageUrl: null,
    reliability: 'trusted',
  }),
  createItem({
    id: 'demo-liverpool-outgoing',
    headline: 'Liverpool forward expected to leave amid squad reshape',
    summary: 'Paul Joyce reports that a Liverpool forward is expected to leave if the right offer arrives.',
    playerName: 'Noah Vento',
    playerImageUrl: null,
    currentClub: liverpool,
    destinationClub: null,
    relatedClubIds: [liverpool.id],
    direction: 'outgoing',
    sourceName: 'The Times',
    sourceDomain: 'thetimes.com',
    sourceUrl: 'https://www.thetimes.com',
    journalistName: 'Paul Joyce',
    publishedAt: new Date(now - 1000 * 60 * 50).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 50).toISOString(),
    imageUrl: null,
    reliability: 'tier_1',
  }),
  createItem({
    id: 'demo-manunited-official',
    headline: 'Manchester United announce first summer arrival',
    summary: 'Official demonstration content: the club publishes a signing announcement and contract details.',
    playerName: 'Darius Cole',
    playerImageUrl: null,
    currentClub: bayern,
    destinationClub: manUnited,
    relatedClubIds: [manUnited.id, bayern.id],
    direction: 'incoming',
    sourceName: 'Manchester United',
    sourceDomain: 'official',
    sourceUrl: 'https://www.manutd.com',
    journalistName: null,
    publishedAt: new Date(now - 1000 * 60 * 10).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 8).toISOString(),
    imageUrl: null,
    isOfficial: true,
    duplicateGroupId: 'manutd-official-arrival',
  }),
];

export const mockTimeline = {
  'demo-liverpool-tier1-agreement': [
    { label: 'Initial contact', publishedAt: new Date(now - 1000 * 60 * 240).toISOString() },
    { label: 'Talks advanced', publishedAt: new Date(now - 1000 * 60 * 150).toISOString() },
    { label: 'Agreement reached', publishedAt: new Date(now - 1000 * 60 * 120).toISOString() },
  ],
  'demo-manunited-advanced-talks': [
    { label: 'Interest reported', publishedAt: new Date(now - 1000 * 60 * 180).toISOString() },
    { label: 'Negotiations ongoing', publishedAt: new Date(now - 1000 * 60 * 95).toISOString() },
  ],
};

export function getMockNewsById(id: string) {
  return mockNews.find((item) => item.id === id) ?? null;
}

export function getMockNewsForClub(clubId: string) {
  return mockNews.filter((item) => item.relatedClubIds.includes(clubId));
}

export function getMockTrendingPlayers() {
  return mockNews.slice(0, 5).map((item) => ({
    id: slugify(item.playerName ?? item.headline),
    name: item.playerName ?? 'Unspecified player',
    club: item.destinationClub?.name ?? item.currentClub?.name ?? 'Unknown',
    status: item.transferStatus,
  }));
}