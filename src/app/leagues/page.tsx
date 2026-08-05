import Link from 'next/link';
import { ArrowLeft, Trophy, ChevronRight, ShieldCheck } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { MobileNavigation } from '@/components/layout/mobile-navigation';
import { leagues, getClubsForLeague } from '@/config/leagues';

export default function LeaguesDirectoryPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
        </div>

        {/* Page Banner */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
            <Trophy className="h-4 w-4" />
            <span>Supported Competitions Directory</span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-white sm:text-3xl">
            Leagues &amp; Supported Clubs
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-xl">
            Select a league to view verified competition-wide transfer news, or open a dedicated team transfer hub.
          </p>
        </section>

        {/* League Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {leagues.map((league) => {
            const leagueClubs = getClubsForLeague(league.id);
            return (
              <div key={league.id} className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{league.country}</span>
                    <h2 className="font-display text-lg font-bold text-white">{league.name}</h2>
                  </div>
                  <Link
                    href={`/league/${league.slug}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    <span>League Feed</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Team Buttons Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {leagueClubs.map((club) => (
                    <Link
                      key={club.id}
                      href={`/club/${club.slug}`}
                      className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs font-medium text-slate-200 hover:border-slate-700 hover:text-white transition-colors"
                    >
                      <span className="truncate">{club.name}</span>
                      <ShieldCheck className="h-3 w-3 text-slate-500 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
