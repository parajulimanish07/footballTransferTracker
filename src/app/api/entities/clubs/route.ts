import { NextResponse } from 'next/server';
import { footballEntityRepository } from '@/lib/entities/entity-repository';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query || query.trim().length < 2) {
    const all = await footballEntityRepository.getAllClubs();
    return NextResponse.json({ clubs: all });
  }

  const sanitized = query.trim().slice(0, 50);
  const found = await footballEntityRepository.findClubByAlias(sanitized);

  if (found) {
    return NextResponse.json({ clubs: [found], total: 1 });
  }

  const all = await footballEntityRepository.getAllClubs();
  const qLower = sanitized.toLowerCase();
  const filtered = all.filter(
    (c) =>
      c.name.toLowerCase().includes(qLower) ||
      c.aliases.some((a) => a.toLowerCase().includes(qLower))
  );

  return NextResponse.json({ clubs: filtered, total: filtered.length });
}
