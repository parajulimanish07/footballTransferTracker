import { NewsCardSkeleton } from '@/components/news/news-card-skeleton';

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-pulse">
      <div className="h-24 w-full rounded-2xl bg-slate-900 border border-slate-800" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <NewsCardSkeleton />
          <NewsCardSkeleton />
        </div>
        <div className="hidden lg:block h-64 rounded-2xl bg-slate-900 border border-slate-800" />
      </div>
    </div>
  );
}
