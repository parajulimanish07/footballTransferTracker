'use client';

import { BarChart3, TrendingUp, Layers, ShieldCheck, Cpu, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/app-header';
import { MobileNavigation } from '@/components/layout/mobile-navigation';

export default function AnalyticsDashboardPage() {
  const metrics = {
    totalFetched: 1420,
    rejectedByFilter: 380,
    duplicatesDetected: 195,
    classifiedTransferNews: 845,
    averageReliabilityScore: 88.4,
    needsReviewCount: 18,
    statusDistribution: [
      { status: 'Official Announcement', count: 120, percentage: 14, color: 'bg-emerald-500' },
      { status: 'Agreement Reached', count: 95, percentage: 11, color: 'bg-emerald-400' },
      { status: 'Advanced Talks', count: 210, percentage: 25, color: 'bg-cyan-500' },
      { status: 'Negotiations Open', count: 180, percentage: 21, color: 'bg-sky-500' },
      { status: 'Bid Submitted', count: 140, percentage: 17, color: 'bg-amber-500' },
      { status: 'General Interest', count: 100, percentage: 12, color: 'bg-slate-400' },
    ],
    directionDistribution: {
      incoming: 62,
      outgoing: 28,
      related: 10,
    },
    topMentionedPlayers: [
      { name: 'Kylian Mbappé', count: 74 },
      { name: 'Riccardo Calafiori', count: 58 },
      { name: 'Victor Osimhen', count: 51 },
      { name: 'Darwin Núñez', count: 42 },
      { name: 'Leny Yoro', count: 36 },
    ],
    topMentionedClubs: [
      { name: 'Arsenal', count: 184 },
      { name: 'Real Madrid', count: 162 },
      { name: 'Liverpool', count: 155 },
      { name: 'Chelsea', count: 129 },
      { name: 'Manchester United', count: 110 },
    ],
    confidenceDistribution: [
      { range: '90% - 100%', count: 520, color: 'bg-emerald-500' },
      { range: '75% - 89%', count: 245, color: 'bg-sky-500' },
      { range: '65% - 74%', count: 62, color: 'bg-amber-500' },
      { range: '< 65% (Needs Review)', count: 18, color: 'bg-rose-500' },
    ],
  };

  return (
    <div className="min-h-screen pb-24 bg-bg text-text font-sans">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-emerald/30 bg-accent-emerald/10 px-3 py-1 text-xs font-semibold text-accent-emerald shadow-emeraldGlow">
            <Cpu className="h-3.5 w-3.5" /> Live AI Telemetry &amp; Metrics
          </div>
        </div>

        {/* Hero Header */}
        <section className="glass-panel rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-cyan">
            <BarChart3 className="h-4 w-4" />
            <span>Platform Analytics &amp; Machine Learning Telemetry</span>
          </div>

          <h1 className="mt-2 font-display text-3xl font-extrabold text-text sm:text-4xl">
            AI Transfer Intelligence <span className="text-accent-emerald">Analytics</span>
          </h1>

          <p className="mt-2 text-sm text-slate-300 max-w-2xl">
            Real-time insights into ingestion statistics, TF-IDF duplicate detection rates, classifier status distributions, and source reliability scores.
          </p>
        </section>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Articles Fetched" value={metrics.totalFetched.toLocaleString()} icon={TrendingUp} subtitle="Total Ingested" />
          <MetricCard title="Filter Rejected" value={metrics.rejectedByFilter.toLocaleString()} icon={ShieldCheck} subtitle="Untrusted Sources" />
          <MetricCard title="Duplicates Grouped" value={metrics.duplicatesDetected.toLocaleString()} icon={Layers} subtitle="TF-IDF Similarity >= 0.82" />
          <MetricCard title="Avg Reliability" value={`${metrics.averageReliabilityScore}/100`} icon={Cpu} subtitle="Editorial Score" />
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transfer Status Distribution */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-text flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-accent-emerald" />
              <span>Transfer-Status Classifier Distribution</span>
            </h3>

            <div className="space-y-3 pt-2">
              {metrics.statusDistribution.map((item) => (
                <div key={item.status} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-text">{item.status}</span>
                    <span className="text-muted">{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ML Confidence Spread */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-text flex items-center gap-2">
              <Cpu className="h-4 w-4 text-accent-cyan" />
              <span>ML Classifier Confidence Spread</span>
            </h3>

            <div className="space-y-3 pt-2">
              {metrics.confidenceDistribution.map((item) => (
                <div key={item.range} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-text">{item.range}</span>
                    <span className="text-muted">{item.count} articles</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${Math.round((item.count / metrics.classifiedTransferNews) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-rose-300">
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> Articles Routed to Review Queue:
              </span>
              <Link href="/admin/review" className="font-bold underline hover:text-text">
                {metrics.needsReviewCount} Needs Review
              </Link>
            </div>
          </div>

          {/* Top Mentioned Players */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-text">Most Mentioned Players</h3>
            <div className="space-y-2.5">
              {metrics.topMentionedPlayers.map((player, idx) => (
                <div key={player.name} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-xs">
                  <span className="font-bold text-text">#{idx + 1} {player.name}</span>
                  <span className="rounded-lg bg-white/10 px-2.5 py-0.5 font-mono text-accent-cyan">{player.count} reports</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Mentioned Clubs */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-text">Most Mentioned Clubs</h3>
            <div className="space-y-2.5">
              {metrics.topMentionedClubs.map((club, idx) => (
                <div key={club.name} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-xs">
                  <span className="font-bold text-text">#{idx + 1} {club.name}</span>
                  <span className="rounded-lg bg-white/10 px-2.5 py-0.5 font-mono text-accent-emerald">{club.count} reports</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, subtitle }: { title: string; value: string; icon: any; subtitle: string }) {
  return (
    <div className="glass-card rounded-3xl p-5 space-y-1">
      <div className="flex items-center justify-between text-muted text-xs">
        <span className="font-semibold uppercase tracking-wider">{title}</span>
        <Icon className="h-4 w-4 text-accent-emerald" />
      </div>
      <div className="font-display text-2xl font-extrabold text-text pt-1">{value}</div>
      <div className="text-[11px] text-slate-400 pt-0.5">{subtitle}</div>
    </div>
  );
}
