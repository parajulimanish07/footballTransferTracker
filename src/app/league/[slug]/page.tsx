import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy, Search, ShieldCheck } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { MobileNavigation } from '@/components/layout/mobile-navigation';
import { NewsFeed } from '@/components/news/news-feed';
import { TransferSummary } from '@/components/shared/transfer-summary';
import { getLeagueBySlug, getClubsForLeague } from '@/config/leagues';
import { getTransferNews } from '@/lib/news/get-transfer-news';

export default async function LeagueHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const league = getLeagueBySlug(slug);

  if (!league) {
    notFound();
  }

  const leagueClubs = getClubsForLeague(league.id);
  const newsResponse = await getTransferNews({ mode: 'global', league: league.slug, limit: 20 });
  const items = newsResponse.data;

  const officialDeals = items.filter((i) => i.transferStatus === 'official').length;
  const advancedTransfers = items.filter(
    (i) => i.transferStatus === 'agreement_reached' || i.transferStatus === 'advanced_talks'
  ).length;
  const activeRumours = items.filter((i) => i.transferStatus !== 'official' && i.transferStatus !== 'not_transfer_news').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/leagues" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Leagues Directory
          </Link>
        </div>

        {/* League Hero Header */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
              <Trophy className="h-4 w-4" />
              <span>{league.country}</span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-extrabold text-white sm:text-3xl">
              {league.name} Transfer Hub
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-xl">
              Latest verified transfer reports and official updates for {league.name} clubs.
            </p>
          </div>

          {/* Horizontal Team Selector */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Clubs:</span>
            {leagueClubs.map((club) => (
              <Link
                key={club.id}
                href={`/club/${club.slug}`}
                className="shrink-0 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
              >
                {club.name}
              </Link>
            ))}
          </div>
        </section>

        {/* High Level Stats Summary */}
        <TransferSummary
          mode="global"
          officialDeals={officialDeals}
          advancedTransfers={advancedTransfers}
          activeRumours={activeRumours}
          reportsToday={items.length}
        />

        {/* News Stream */}
        <NewsFeed items={items} />
      </main>

      <MobileNavigation />
    </div>
  );
}
