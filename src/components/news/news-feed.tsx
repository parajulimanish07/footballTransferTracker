import { TransferNewsCard } from './transfer-news-card';
import { EmptyNewsState } from '@/components/shared/empty-news-state';
import type { TransferNewsItem } from '@/types/news';

export function NewsFeed({
  items,
  selectedClubId,
}: {
  items: TransferNewsItem[];
  selectedClubId?: string | null;
}) {
  if (!items.length) return <EmptyNewsState />;
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <TransferNewsCard key={item.id} item={item} selectedClubId={selectedClubId} />
      ))}
    </div>
  );
}