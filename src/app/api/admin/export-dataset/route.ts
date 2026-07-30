import { NextRequest, NextResponse } from 'next/server';
import { articleRepository } from '@/lib/storage/article-repository';

export async function GET(_request: NextRequest) {
  try {
    const reviewedRecords = articleRepository.getHumanReviewedArticles();

    const headers = ['id', 'headline', 'description', 'source', 'journalist', 'club', 'published_at', 'label', 'provider'];
    const rows = reviewedRecords.map((item) =>
      [
        item.externalId,
        `"${(item.headline || '').replace(/"/g, '""')}"`,
        `"${(item.description || '').replace(/"/g, '""')}"`,
        item.sourceDomain,
        item.journalistName || 'Unknown',
        item.relatedClubHints[0] || 'Unspecified',
        item.publishedAt,
        item.humanLabel,
        item.provider,
      ].join(',')
    );

    const csvText = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csvText, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="reviewed_transfer_dataset_${Date.now()}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to export reviewed dataset' }, { status: 500 });
  }
}
