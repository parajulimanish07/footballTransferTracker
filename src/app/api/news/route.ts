import { NextRequest, NextResponse } from 'next/server';
import { newsQuerySchema } from '@/lib/news/query';
import { getTransferNews } from '@/lib/news/get-transfer-news';
import { getClubById } from '@/config/clubs';

export async function GET(request: NextRequest) {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = newsQuerySchema.safeParse(params);

    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid query parameters.' }, { status: 400 });
    }

    const clubIds = parsed.data.club ? [getClubById(parsed.data.club)?.id ?? parsed.data.club] : undefined;

    try {
        const response = await getTransferNews({ ...parsed.data, clubIds });
        return NextResponse.json(response, { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=120' } });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch verified transfer news.' }, { status: 500 });
    }
}