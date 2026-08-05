'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Plus, ShieldCheck, RefreshCw } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { MobileNavigation } from '@/components/layout/mobile-navigation';
import { NewsFeed } from '@/components/news/news-feed';
import { NewsCardSkeleton } from '@/components/news/news-card-skeleton';
import { useFeedPreference } from '@/hooks/use-feed-preference';
import { clubs } from '@/config/clubs';
import type { NewsApiResponse, TransferNewsItem } from '@/types/news';

export default function FollowingPage() {
  const { settings, hydrated } = useFeedPreference();
  const [data, setData] = useState<NewsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const followedClubsList = useMemo(() => {
    const ids = new Set(settings.followedClubIds);
    return clubs.filter((c) => ids.has(c.id));
  }, [settings.followedClubIds]);

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    setLoading(true);

    const clubParam = settings.followedClubIds.length ? settings.followedClubIds.join(',') : '';
    const query = clubParam ? `mode=club&clubIds=${clubParam}` : 'mode=global';

    fetch(`/api/news?${query}`)
      .then((res) => res.json())
      .then((json: NewsApiResponse) => {
        if (!active) return;
        setData(json);
      })
      .catch(() => {})
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [settings.followedClubIds, hydrated]);

  const items: TransferNewsItem[] = data?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
        </div>

        {/* Following Banner */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
                <Heart className="h-4 w-4" />
                <span>Personalised Feed</span>
              </div>
              <h1 className="mt-2 font-display text-2xl font-extrabold text-white sm:text-3xl">
                Following Feed
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-xl">
                Combined verified transfer reports for your followed teams.
              </p>
            </div>

            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Manage Followed</span>
            </Link>
          </div>

          {/* Followed Clubs Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Following:</span>
            {followedClubsList.length ? (
              followedClubsList.map((club) => (
                <span
                  key={club.id}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs font-semibold text-slate-200"
                >
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  <span>{club.name}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No specific clubs followed. Showing overall feed.</span>
            )}
          </div>
        </section>

        {/* Stream */}
        {loading ? (
          <div className="space-y-4">
            <NewsCardSkeleton />
            <NewsCardSkeleton />
          </div>
        ) : (
          <NewsFeed items={items} />
        )}
      </main>

      <MobileNavigation />
    </div>
  );
}
