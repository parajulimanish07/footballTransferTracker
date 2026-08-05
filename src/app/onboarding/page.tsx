'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Globe, Layers, CheckCircle2 } from 'lucide-react';
import { ClubSelector } from '@/components/clubs/club-selector';
import { useFeedPreference } from '@/hooks/use-feed-preference';

export default function OnboardingPage() {
  const router = useRouter();
  const { settings, setSettings, hydrated } = useFeedPreference();
  const [selectedOption, setSelectedOption] = useState<'global' | 'clubs'>('global');
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>([]);

  useEffect(() => {
    if (hydrated) {
      if (settings.defaultMode === 'club' && settings.followedClubIds.length > 0) {
        setSelectedOption('clubs');
        setSelectedClubIds(settings.followedClubIds);
      }
    }
  }, [settings, hydrated]);

  function handleBrowseAll() {
    setSettings({
      defaultMode: 'global',
      defaultClubId: null,
      followedClubIds: [],
    });
    router.push('/dashboard?mode=global');
  }

  function handleContinue() {
    if (selectedOption === 'global') {
      handleBrowseAll();
    } else {
      if (selectedClubIds.length === 0) return;
      setSettings({
        defaultMode: 'club',
        defaultClubId: selectedClubIds[0],
        followedClubIds: selectedClubIds,
      });
      router.push(`/dashboard?club=${selectedClubIds[0]}`);
    }
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
            How would you like to use <span className="text-accent-emerald">Transfer Tracker</span>?
          </h1>

          <p className="mt-3.5 max-w-xl text-sm leading-relaxed text-slate-300">
            Choose your primary feed preference. You can change this anytime or switch between modes.
          </p>
        </div>

        {/* Large Option Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A: Browse All Transfer News */}
          <button
            type="button"
            onClick={() => setSelectedOption('global')}
            className={`relative flex flex-col justify-between rounded-2xl p-6 text-left transition-all border ${
              selectedOption === 'global'
                ? 'border-accent-emerald bg-accent-emerald/10 shadow-emeraldGlow ring-2 ring-accent-emerald'
                : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-emerald/20 text-accent-emerald">
                  <Globe className="h-5 w-5" />
                </div>
                {selectedOption === 'global' && <CheckCircle2 className="h-5 w-5 text-accent-emerald" />}
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-text">Browse All Transfer News</h3>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                Follow verified transfer activity across major clubs and leagues without selecting a specific team.
              </p>
            </div>
            <span className="mt-6 text-[11px] font-semibold text-accent-emerald">Global Feed Mode</span>
          </button>

          {/* Option B: Follow Specific Clubs */}
          <button
            type="button"
            onClick={() => setSelectedOption('clubs')}
            className={`relative flex flex-col justify-between rounded-2xl p-6 text-left transition-all border ${
              selectedOption === 'clubs'
                ? 'border-accent-cyan bg-accent-cyan/10 shadow-soft ring-2 ring-accent-cyan'
                : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-cyan/20 text-accent-cyan">
                  <Layers className="h-5 w-5" />
                </div>
                {selectedOption === 'clubs' && <CheckCircle2 className="h-5 w-5 text-accent-cyan" />}
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-text">Follow Specific Clubs</h3>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                Create a personalised transfer feed for your favourite teams with dedicated club hubs.
              </p>
            </div>
            <span className="mt-6 text-[11px] font-semibold text-accent-cyan">Personalised Hub Mode</span>
          </button>
        </div>

        {/* Club Selector when Option B is selected */}
        {selectedOption === 'clubs' && (
          <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
            <h4 className="text-sm font-bold text-text">Select your favourite clubs:</h4>
            <ClubSelector value={selectedClubIds} onChange={setSelectedClubIds} />
          </div>
        )}

        {/* Action Toolbar */}
        <div className="mt-8 flex flex-col gap-4 pt-6 border-t border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleBrowseAll}
            className="text-xs text-muted hover:text-text underline underline-offset-4"
          >
            Skip and browse all news
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={selectedOption === 'clubs' && selectedClubIds.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-emerald px-6 py-3 text-sm font-bold text-slate-950 shadow-emeraldGlow hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <span>{selectedOption === 'global' ? 'Open Global Feed' : 'Open Transfer Hub'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
}