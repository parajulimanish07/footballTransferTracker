'use client';

import { BarChart3, TrendingUp, Layers, ShieldCheck, Cpu, AlertTriangle, ArrowLeft, Globe, Filter } from 'lucide-react';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/app-header';
import { MobileNavigation } from '@/components/layout/mobile-navigation';

export default function AnalyticsDashboardPage() {
  const metrics = {
    totalFetched: 1420,
    globalFeedViews: 3840,
    clubFeedViews: 2190,
    rejectedNonTransfer: 380,
    duplicatesDetected: 195,
    classifiedTransferNews: 845,
    averageReliabilityScore: 88.4,
    needsReviewCount: 18,
    feedModeDistribution: [
      { mode: 'Global Feed ("Browse All")', views: 3840, percentage: 64, color: 'bg-emerald-500' },
      { mode: 'Club Feed ("Dedicated Hubs")', views: 2190, percentage: 36, color: 'bg-cyan-500' },
    ],
    statusDistribution: [
      { status: 'Official Deals', count: 120, percentage: 14, color: 'bg-emerald-500' },
      { status: 'Advanced Transfers', count: 305, percentage: 36, color: 'bg-cyan-500' },
      { status: 'Active Rumours', count: 420, percentage: 50, color: 'bg-amber-500' },
    ],
    mostFilteredClubs: [
      { name: 'Real Madrid', count: 480 },
      { name: 'Manchester City', count: 412 },
      { name: 'Liverpool', count: 395 },
      { name: 'Arsenal', count: 340 },
      { name: 'Chelsea', count: 290 },
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
            <span>Platform Analytics &amp; Feed Mode Metrics</span>
          </div>

          <h1 className="mt-2 font-display text-3xl font-extrabold text-text sm:text-4xl">
            AI Transfer Intelligence <span className="text-accent-emerald">Analytics</span>
          </h1>

          <p className="mt-2 text-sm text-slate-300 max-w-2xl">
            Real-time insights into Global vs Club feed views, TF-IDF duplicate grouping, classifier distributions, and rejected non-transfer articles.
          </p>
        </section>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Global Feed Views" value={metrics.globalFeedViews.toLocaleString()} icon={Globe} subtitle="Browse All Mode" />
          <MetricCard title="Club Feed Views" value={metrics.clubFeedViews.toLocaleString()} icon={Filter} subtitle="Personalised Hubs" />
          <MetricCard title="Duplicates Grouped" value={metrics.duplicatesDetected.toLocaleString()} icon={Layers} subtitle="TF-IDF Similarity >= 0.82" />
          <MetricCard title="Rejected Non-Transfer" value={metrics.rejectedNonTransfer.toLocaleString()} icon={ShieldCheck} subtitle="Filtered Stories" />
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feed Mode Usage */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-text flex items-center gap-2">
              <Globe className="h-4 w-4 text-accent-emerald" />
              <span>Feed Mode Usage (Global vs Club)</span>
            </h3>

            <div className="space-y-3 pt-2">
              {metrics.feedModeDistribution.map((item) => (
                <div key={item.mode} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-text">{item.mode}</span>
                    <span className="text-muted">{item.views} views ({item.percentage}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transfer Status Distribution */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-text flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-accent-cyan" />
              <span>Global Transfer Status Breakdown</span>
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

          {/* Most Filtered Clubs */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-text flex items-center gap-2">
              <Filter className="h-4 w-4 text-accent-emerald" />
              <span>Most Filtered Clubs in Global Mode</span>
            </h3>
            <div className="space-y-2.5 pt-2">
              {metrics.mostFilteredClubs.map((club, idx) => (
                <div key={club.name} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-xs">
                  <span className="font-bold text-text">#{idx + 1} {club.name}</span>
                  <span className="rounded-lg bg-white/10 px-2.5 py-0.5 font-mono text-accent-emerald">{club.count} filters</span>
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
