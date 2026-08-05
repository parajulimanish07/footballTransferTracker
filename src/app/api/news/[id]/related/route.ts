import { NextResponse } from 'next/server';
import { articleRepository } from '@/lib/storage/article-repository';
import { searchHybridArticles } from '@/lib/rag/hybrid-search-engine';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const targetArticle = await articleRepository.getArticleById(id);

  if (!targetArticle) {
    return NextResponse.json({ data: [] });
  }

  // Search related articles using hybrid semantic search
  const query = `${targetArticle.headline} ${targetArticle.playerName || ''}`;
  const searchResults = await searchHybridArticles({
    query,
    playerName: targetArticle.playerName || undefined,
    limit: 10,
  });

  // Exclude self and map related items
  const related = searchResults
    .filter((res) => res.article.id !== targetArticle.id)
    .map((res) => ({
      id: res.article.id,
      headline: res.article.headline,
      summary: res.article.description,
      sourceName: res.article.sourceName,
      sourceUrl: res.article.sourceUrl,
      publishedAt: res.article.publishedAt,
      similarityScore: Math.round(res.semanticScore * 100),
    }));

  return NextResponse.json({ data: related });
}
