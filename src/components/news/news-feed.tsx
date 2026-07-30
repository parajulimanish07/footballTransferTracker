import { TransferNewsCard } from './transfer-news-card';
import { EmptyNewsState } from '@/components/shared/empty-news-state';
import type { TransferNewsItem } from '@/types/news';

export function NewsFeed({ items }: { items: TransferNewsItem[] }) {
  if (!items.length) return <EmptyNewsState />;
  return <div className="space-y-4">{items.map((item) => <TransferNewsCard key={item.id} item={item} />)}</div>;
}