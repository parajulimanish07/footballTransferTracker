import { Button } from '@/components/ui/button';

export function ErrorState({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) {
  return (
    <div className="glass-panel rounded-3xl p-8 text-center">
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <p className="mt-2 text-sm text-muted">{message}</p>
      {onRetry ? <Button className="mt-5" onClick={onRetry}>Retry</Button> : null}
    </div>
  );
}