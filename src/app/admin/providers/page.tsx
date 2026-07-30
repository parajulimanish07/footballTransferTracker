'use client';

import { useState, useEffect } from 'react';
import { Server, Activity, ShieldCheck, RefreshCw, ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Download } from 'lucide-react';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/app-header';
import { MobileNavigation } from '@/components/layout/mobile-navigation';

interface ProviderStatusCard {
  id: string;
  name: string;
  enabled: boolean;
  lastFetch: string;
  lastError: string | null;
  receivedCount: number;
  acceptedCount: number;
  rejectedCount: number;
  duplicateCount: number;
}

const mockProviderStates: ProviderStatusCard[] = [
  {
    id: 'guardian',
    name: 'The Guardian Open Platform API',
    enabled: true,
    lastFetch: '2 mins ago',
    lastError: null,
    receivedCount: 45,
    acceptedCount: 38,
    rejectedCount: 7,
    duplicateCount: 4,
  },
  {
    id: 'bbc-rss',
    name: 'BBC Sport Football RSS Feed',
    enabled: true,
    lastFetch: '5 mins ago',
    lastError: null,
    receivedCount: 30,
    acceptedCount: 28,
    rejectedCount: 2,
    duplicateCount: 6,
  },
  {
    id: 'official-club',
    name: 'Official Club RSS & Press Feeds',
    enabled: true,
    lastFetch: '10 mins ago',
    lastError: null,
    receivedCount: 18,
    acceptedCount: 18,
    rejectedCount: 0,
    duplicateCount: 0,
  },
  {
    id: 'manual',
    name: 'Manual Trusted Submissions Repository',
    enabled: true,
    lastFetch: '1 hour ago',
    lastError: null,
    receivedCount: 12,
    acceptedCount: 12,
    rejectedCount: 0,
    duplicateCount: 1,
  },
  {
    id: 'gnews',
    name: 'GNews Discovery API Provider',
    enabled: false,
    lastFetch: 'Unconfigured',
    lastError: 'GNEWS_API_KEY environment variable not set',
    receivedCount: 0,
    acceptedCount: 0,
    rejectedCount: 0,
    duplicateCount: 0,
  },
  {
    id: 'newsapi',
    name: 'NewsAPI Backup Provider',
    enabled: true,
    lastFetch: '15 mins ago',
    lastError: null,
    receivedCount: 24,
    acceptedCount: 15,
    rejectedCount: 9,
    duplicateCount: 3,
  },
];

export default function ProviderMonitoringPage() {
  const [providers, setProviders] = useState<ProviderStatusCard[]>(mockProviderStates);
  const [refreshing, setRefreshing] = useState(false);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }

  function handleExportDataset() {
    window.location.href = '/api/admin/export-dataset';
  }

  return (
    <div className="min-h-screen pb-24 bg-bg text-text font-sans">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-emerald/30 bg-accent-emerald/10 px-3 py-1 text-xs font-semibold text-accent-emerald shadow-emeraldGlow">
            <Activity className="h-3.5 w-3.5" /> Provider Telemetry Active
          </div>
        </div>

        {/* Hero Header */}
        <section className="glass-panel rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-cyan">
                <Server className="h-4 w-4" />
                <span>Multi-Source Ingestion Pipeline Telemetry</span>
              </div>

              <h1 className="mt-2 font-display text-3xl font-extrabold text-text">
                News Provider <span className="text-accent-emerald">Monitoring</span>
              </h1>

              <p className="mt-2 text-sm text-slate-300 max-w-xl">
                Monitor health status, fetch rates, rejection filters, and duplicate grouping metrics across all ingestion feeds.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleExportDataset}
                className="inline-flex items-center gap-2 rounded-xl border border-accent-emerald/30 bg-accent-emerald/10 px-4 py-2.5 text-xs font-bold text-accent-emerald hover:bg-accent-emerald hover:text-slate-950 transition-all"
              >
                <Download className="h-4 w-4" /> Export Reviewed Dataset
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-text hover:bg-white/10 transition-all"
              >
                <RefreshCw className={`h-4 w-4 text-accent-emerald ${refreshing ? 'animate-spin' : ''}`} />
                <span>Sync Metrics</span>
              </button>
            </div>
          </div>
        </section>

        {/* Provider Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((prov) => (
            <div
              key={prov.id}
              className={`glass-card rounded-3xl p-6 space-y-4 border ${
                prov.enabled ? 'border-white/10' : 'border-rose-500/20 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 font-display font-bold text-text">
                  <Server className="h-4 w-4 text-accent-emerald" />
                  <span>{prov.name}</span>
                </div>
                {prov.enabled ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> ENABLED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-[11px] font-bold text-rose-400">
                    <XCircle className="h-3 w-3" /> DISABLED
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <span className="text-muted block text-[11px]">Last Sync</span>
                  <strong className="text-text">{prov.lastFetch}</strong>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <span className="text-muted block text-[11px]">Received / Accepted</span>
                  <strong className="text-accent-emerald">{prov.acceptedCount} / {prov.receivedCount}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <span className="text-muted block text-[11px]">Rejected (Untrusted)</span>
                  <strong className="text-rose-400">{prov.rejectedCount}</strong>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <span className="text-muted block text-[11px]">Grouped Duplicates</span>
                  <strong className="text-amber-400">{prov.duplicateCount}</strong>
                </div>
              </div>

              {prov.lastError && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-[11px] text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>{prov.lastError}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
