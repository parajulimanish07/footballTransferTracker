import { NextResponse } from 'next/server';
import { footballEntityRepository } from '@/lib/entities/entity-repository';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ players: [] });
  }

  // Cap query string length to 50 chars for security
  const sanitized = query.trim().slice(0, 50);
  const players = await footballEntityRepository.findPlayersByName(sanitized);

  // Return max 20 players
  return NextResponse.json({
    players: players.slice(0, 20),
    total: players.length,
  });
}
