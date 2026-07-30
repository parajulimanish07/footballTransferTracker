import { NextResponse } from 'next/server';
import { clubs } from '@/config/clubs';

export async function GET() {
  return NextResponse.json({ data: clubs, meta: { total: clubs.length } });
}