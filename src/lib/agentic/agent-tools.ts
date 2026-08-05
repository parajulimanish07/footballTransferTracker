import { getTransferNews } from '@/lib/news/get-transfer-news';
import { getClubById, getClubBySlug } from '@/config/clubs';
import { getLeagueBySlug, getLeagueById } from '@/config/leagues';
import type { TransferNewsItem } from '@/types/news';

export async function searchReports(query: string): Promise<TransferNewsItem[]> {
  const res = await getTransferNews({ mode: 'global', search: query, limit: 10 });
  return res.data;
}

export async function getPlayerTimeline(playerName: string): Promise<TransferNewsItem[]> {
  const res = await getTransferNews({ mode: 'global', search: playerName, limit: 20 });
  return res.data.filter(
    (item) => item.playerName && item.playerName.toLowerCase().includes(playerName.toLowerCase())
  );
}

export async function getClubTransferNews(clubIdOrSlug: string): Promise<TransferNewsItem[]> {
  const club = getClubBySlug(clubIdOrSlug) || getClubById(clubIdOrSlug);
  if (!club) return [];
  const res = await getTransferNews({ mode: 'club', selectedClubId: club.id, limit: 20 });
  return res.data;
}

export async function getLeagueTransferNews(leagueSlug: string): Promise<TransferNewsItem[]> {
  const league = getLeagueBySlug(leagueSlug);
  if (!league) return [];
  const res = await getTransferNews({ mode: 'global', league: league.slug, limit: 20 });
  return res.data;
}

export async function compareTrustedSources(playerName: string) {
  const reports = await getPlayerTimeline(playerName);
  const sources = Array.from(new Set(reports.map((r) => r.sourceName)));
  return {
    playerName,
    reportCount: reports.length,
    distinctSources: sources,
    reports,
  };
}

export async function getSourceReliability(sourceName: string) {
  const reports = await searchReports(sourceName);
  const total = reports.length;
  const officialCount = reports.filter((r) => r.isOfficial || r.reliability === 'official').length;

  return {
    sourceName,
    sampleSize: total,
    officialRate: total > 0 ? officialCount / total : 0,
  };
}
