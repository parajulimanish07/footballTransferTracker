'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ShieldCheck, ArrowRight, Flame } from 'lucide-react';
import { ClubSelector } from '@/components/clubs/club-selector';
import { useFollowedClubs } from '@/hooks/use-followed-clubs';

export default function OnboardingPage() {
  const router = useRouter();
  const { followedClubs, setFollowedClubs } = useFollowedClubs();
  const [selected, setSelected] = useState<string[]>(followedClubs.length ? followedClubs : ['liverpool', 'arsenal', 'real-madrid']);

  function continueToDashboard() {
    setFollowedClubs(selected);
    router.push(`/dashboard?club=${selected[0] ?? 'liverpool'}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="glass-panel relative overflow-hidden rounded-3xl p-6 sm:p-10 shadow-soft">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-emerald/30 bg-accent-emerald/10 px-3.5 py-1 text-xs font-semibold text-accent-emerald shadow-emeraldGlow">
            <ShieldCheck className="h-4 w-4" />
            <span>Tier-1 Verified Transfer News</span>
          </div>

          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-text sm:text-5xl">
            Transfer news <span className="text-accent-emerald">without the noise</span>.
          </h1>

          <p className="mt-3.5 max-w-xl text-sm leading-relaxed text-slate-300">
            Select the football clubs you support. Transfer Tracker filters out social media rumor mills, clickbait aggregators, and unverified reports to show only real developments.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <ClubSelector value={selected} onChange={setSelected} />
        </div>

        <div className="mt-8 flex flex-col gap-4 pt-6 border-t border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            Selected <strong className="text-text">{selected.length}</strong> club{selected.length === 1 ? '' : 's'}. You can update your preferences anytime.
          </p>

          <button
            type="button"
            onClick={continueToDashboard}
            disabled={!selected.length}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-emerald px-6 py-3 text-sm font-bold text-slate-950 shadow-emeraldGlow hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <span>Open Transfer Hub</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
}