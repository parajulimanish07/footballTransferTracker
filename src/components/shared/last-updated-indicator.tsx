import { Clock3 } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';

export function LastUpdatedIndicator({ updatedAt }: { updatedAt: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted">
      <Clock3 className="h-3.5 w-3.5" />
      Updated {formatDistanceToNowStrict(new Date(updatedAt), { addSuffix: true })}
    </div>
  );
}