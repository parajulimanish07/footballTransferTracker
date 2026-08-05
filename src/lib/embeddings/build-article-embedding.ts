import type { StoredTransferArticle } from '@/lib/storage/article-repository';

export function buildArticleEmbeddingText(article: Partial<StoredTransferArticle>): string {
  const parts: string[] = [];

  if (article.headline) {
    parts.push(`Headline: ${article.headline.trim()}`);
  }

  if (article.playerName) {
    parts.push(`Player: ${article.playerName.trim()}`);
  }

  if (article.currentClubId) {
    parts.push(`Current club: ${article.currentClubId}`);
  }

  if (article.destinationClubId || article.interestedClubId) {
    parts.push(`Interested club: ${article.destinationClubId || article.interestedClubId}`);
  }

  if (article.leagueId) {
    parts.push(`League: ${article.leagueId}`);
  }

  if (article.transferStatus) {
    parts.push(`Status: ${article.transferStatus}`);
  }

  if (article.sourceName) {
    parts.push(`Source: ${article.sourceName}`);
  }

  if (article.publishedAt) {
    const pubDate = new Date(article.publishedAt).toISOString().split('T')[0];
    parts.push(`Published: ${pubDate}`);
  }

  if (article.description || article.cleanedText) {
    const summary = (article.description || article.cleanedText || '').trim();
    // Exclude HTML tags, provider boilerplate, or ads
    const cleanSummary = summary.replace(/<[^>]*>/g, '').replace(/https?:\/\/\S+/g, '');
    parts.push(`Summary: ${cleanSummary}`);
  }

  return parts.join('\n');
}
