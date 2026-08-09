import { NextRequest, NextResponse } from 'next/server';
import { articleRepository } from '@/lib/storage/article-repository';
import { isTrustedDomain, isTrustedSource } from '@/lib/news/filter-trusted-sources';
import { predictTransferStatus } from '@/lib/ml/ml-client';
import type { RawNewsArticle } from '@/lib/news/providers/provider-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      headline,
      description,
      sourceUrl,
      publisher,
      journalist,
      publishedAt,
      playerName,
      currentClub,
      destinationClub,
      suggestedStatus,
    } = body;

    // Required fields check
    if (!headline || !description || !sourceUrl || !publisher) {
      return NextResponse.json(
        { error: 'Missing required fields: headline, summary, sourceUrl, publisher' },
        { status: 400 }
      );
    }

    // URL validation
    let domain = '';
    try {
      const parsedUrl = new URL(sourceUrl);
      domain = parsedUrl.hostname.replace(/^www\./, '').toLowerCase();
    } catch {
      return NextResponse.json({ error: 'Invalid source URL format' }, { status: 400 });
    }

    // Duplicate URL check
    const existing = articleRepository.getByUrl(sourceUrl);
    if (existing) {
      return NextResponse.json({ error: 'An article with this exact URL already exists in storage.' }, { status: 409 });
    }

    // Duplicate headline check
    const allArticles = articleRepository.getAll();
    const duplicateHeadline = allArticles.find(
      (a: any) => a.headline.toLowerCase() === headline.toLowerCase()
    );
    if (duplicateHeadline) {
      return NextResponse.json(
        { error: 'An article with identical headline already exists in storage.' },
        { status: 409 }
      );
    }

    // Source reliability check
    const trusted = isTrustedSource(domain, journalist || null);
    if (!trusted) {
      return NextResponse.json(
        { error: `Publisher domain "${domain}" or journalist "${journalist || 'None'}" is not in the approved trusted source registry.` },
        { status: 422 }
      );
    }

    const externalId = `manual-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const rawArticle: RawNewsArticle = {
      externalId,
      headline,
      description,
      bodyText: null,
      sourceName: publisher,
      sourceDomain: domain,
      sourceUrl,
      journalistName: journalist || null,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
      imageUrl: null,
      relatedClubHints: [currentClub, destinationClub].filter(Boolean) as string[],
      provider: 'manual',
    };

    // Save raw article
    articleRepository.saveRawArticle(rawArticle);

    // Run ML prediction
    const mlRes = await predictTransferStatus({
      headline,
      description,
      sourceDomain: domain,
      isOfficial: domain === 'official' || domain.includes('premierleague.com'),
    });

    // Update repository record
    articleRepository.updateProcessedArticle(externalId, {
      processingStatus: 'processed',
      mlPrediction: mlRes.prediction,
      confidence: mlRes.confidence,
      reliabilityScore: 90,
      humanLabel: suggestedStatus || mlRes.prediction,
    });

    return NextResponse.json({
      success: true,
      id: externalId,
      mlPrediction: mlRes.prediction,
      confidence: mlRes.confidence,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
