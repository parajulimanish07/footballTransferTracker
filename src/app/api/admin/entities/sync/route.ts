import { NextResponse } from 'next/server';
import {
  syncSupportedLeagues,
  syncLeagueTeams,
  syncTeamSquad,
  getLatestSyncRuns,
  getEntityFreshness,
} from '@/lib/entities/entity-sync-engine';

export async function GET() {
  return NextResponse.json({
    provider: process.env.FOOTBALL_ENTITY_PROVIDER || 'mock',
    freshness: getEntityFreshness(),
    recentRuns: getLatestSyncRuns(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { syncType, targetId } = body;

    let result;
    if (syncType === 'leagues') {
      result = await syncSupportedLeagues();
    } else if (syncType === 'teams' && targetId) {
      result = await syncLeagueTeams(targetId);
    } else if (syncType === 'squad' && targetId) {
      result = await syncTeamSquad(targetId);
    } else {
      return NextResponse.json({ error: 'Invalid syncType or targetId' }, { status: 400 });
    }

    return NextResponse.json({ success: true, run: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Entity sync failed' }, { status: 500 });
  }
}
