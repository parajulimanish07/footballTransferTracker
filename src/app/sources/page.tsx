'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ShieldCheck, Info, CheckCircle2, ArrowUpDown, ExternalLink } from 'lucide-react';
import { trustedSources } from '@/config/trusted-sources';
import { AppHeader } from '@/components/layout/app-header';
import { MobileNavigation } from '@/components/layout/mobile-navigation';
import { ReliabilityBadge } from '@/components/reliability/reliability-badge';

export default function SourcesPage() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score');

  const filteredSources = useMemo(() => {
    return trustedSources
      .filter((source) => {
        const matchesSearch =
          source.name.toLowerCase().includes(search.toLowerCase()) ||
          source.domain?.toLowerCase().includes(search.toLowerCase()) ||
          source.specialistClubs.some((c) => c.toLowerCase().includes(search.toLowerCase())) ||
          source.specialistLeagues.some((l) => l.toLowerCase().includes(search.toLowerCase()));

        const matchesTier = tierFilter === 'all' || source.reliabilityTier === tierFilter;

        return matchesSearch && matchesTier;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.reliabilityScore - a.reliabilityScore;
        return a.name.localeCompare(b.name);
      });
  }, [search, tierFilter, sortBy]);

  return (
    <div className="min-h-screen pb-24 bg-bg text-text font-sans">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Banner */}
        <section className="glass-panel rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-emerald">
            <ShieldCheck className="h-4 w-4" />
            <span>Editorial Standards</span>
          </div>

          <h1 className="mt-2 font-display text-3xl font-extrabold text-text sm:text-4xl">
            Trusted Source <span className="text-accent-emerald">Directory</span>
          </h1>

          <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-slate-300">
            Transfer Tracker uses strict domain, journalist, and historical accuracy verification to score football news outlets.
          </p>

          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-200">
            <Info className="h-4 w-4 shrink-0 text-accent-amber mt-0.5" />
            <span>
              <strong>Editorial Notice:</strong> Reliability scores are calculated using Transfer Tracker&apos;s proprietary verification methodology (Source 40%, Journalist 30%, Cross-confirmation 20%, Recency 10%) and represent internal editorial ratings, not universal objective facts.
            </span>
          </div>
        </section>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by source, domain, or club..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs text-text placeholder:text-muted focus:border-accent-emerald focus:outline-none focus:ring-1 focus:ring-accent-emerald transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setTierFilter('all')}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
                  tierFilter === 'all' ? 'bg-accent-emerald text-slate-950 shadow-sm' : 'text-muted hover:text-text'
                }`}
              >
                All Tiers
              </button>
              <button
                type="button"
                onClick={() => setTierFilter('official')}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
                  tierFilter === 'official' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-muted hover:text-text'
                }`}
              >
                Official
              </button>
              <button
                type="button"
                onClick={() => setTierFilter('tier_1')}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
                  tierFilter === 'tier_1' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-muted hover:text-text'
                }`}
              >
                Tier 1
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSortBy(sortBy === 'score' ? 'name' : 'score')}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-muted hover:text-text hover:bg-white/10 transition-colors"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Sort: {sortBy === 'score' ? 'Score' : 'Name'}</span>
            </button>
          </div>
        </div>

        {/* Sources Directory Table */}
        <div className="glass-panel overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.03] uppercase tracking-wider text-muted font-bold">
                <tr>
                  <th className="px-5 py-3.5">Source & Type</th>
                  <th className="px-5 py-3.5">Tier & Rating</th>
                  <th className="px-5 py-3.5">Specialist Focus</th>
                  <th className="px-5 py-3.5">Verification Method</th>
                  <th className="px-5 py-3.5">Last Reviewed</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSources.map((source) => (
                  <tr key={source.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-sm text-text flex items-center gap-2">
                        <span>{source.name}</span>
                        {source.profileUrl && (
                          <Link href={source.profileUrl} target="_blank" className="text-muted hover:text-accent-emerald">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                      <div className="text-muted text-[11px] mt-0.5">
                        <span className="capitalize">{source.type}</span> • {source.domain || 'Domain Verified'}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <ReliabilityBadge level={source.reliabilityTier} />
                        <span className="font-display font-extrabold text-sm text-accent-emerald">
                          {source.reliabilityScore}/100
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-slate-300 font-medium">
                        {source.specialistClubs.slice(0, 3).join(', ')}
                      </div>
                      <div className="text-muted text-[11px] mt-0.5">
                        {source.specialistLeagues.join(', ')}
                      </div>
                    </td>

                    <td className="px-5 py-4 max-w-xs text-slate-300 leading-relaxed">
                      {source.verificationMethod}
                    </td>

                    <td className="px-5 py-4 text-muted">
                      {source.lastReviewedAt}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
