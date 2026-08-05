import { NextResponse } from 'next/server';
import { articleRepository } from '@/lib/storage/article-repository';
import { getActiveEmbeddingProvider } from '@/lib/embeddings/embedding-provider';
import { buildArticleEmbeddingText } from '@/lib/embeddings/build-article-embedding';

export async function POST() {
  const pendingArticles = await articleRepository.queryArticles({ embeddingStatus: 'pending' });
  const failedArticles = await articleRepository.queryArticles({ embeddingStatus: 'failed' });
  const toProcess = [...pendingArticles, ...failedArticles];

  const provider = getActiveEmbeddingProvider();
  let processedCount = 0;
  let successCount = 0;
  let failCount = 0;

  for (const article of toProcess) {
    try {
      processedCount++;
      const textToEmbed = buildArticleEmbeddingText(article);
      const vector = await provider.embedText(textToEmbed);
      await articleRepository.saveEmbedding(article.id, vector, provider.id);
      successCount++;
    } catch {
      failCount++;
      await articleRepository.markEmbeddingFailed(article.id);
    }
  }

  const telemetry = await articleRepository.getTelemetry();

  return NextResponse.json({
    status: 'completed',
    processedCount,
    successCount,
    failCount,
    telemetry,
  });
}
