import { TransferNewsCard } from '@/components/news/transfer-news-card';
import type { TransferNewsItem } from '@/types/news';

export default function NewsCard({ newsItem }: { newsItem: TransferNewsItem }) {
  return <TransferNewsCard item={newsItem} />;
}