'use client';

import { useState } from 'react';
import { AlertTriangle, Check, X, Layers, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/app-header';
import { MobileNavigation } from '@/components/layout/mobile-navigation';

interface ReviewQueueItem {
  id: string;
  headline: string;
  description: string;
  source: string;
  journalist: string | null;
  predictedStatus: string;
  confidence: number;
  reason: string;
  duplicateCandidate?: string;
}

const mockReviewItems: ReviewQueueItem[] = [
  {
    id: 'rev-1',
    headline: 'Arsenal exploring midfield options as transfer deadline approaches',
    description: 'Gunners management considering multiple profiles to reinforce mid-pitch options.',
    source: 'skysports.com',
    journalist: null,
    predictedStatus: 'INTEREST',
    confidence: 0.52,
    reason: 'Low ML confidence (52% < 65% threshold) & Missing journalist author',
  },
  {
    id: 'rev-2',
    headline: 'Liverpool and Real Madrid linked with £60m wonderkid',
    description: 'European heavyweights monitoring 19-year-old attacking talent ahead of summer move.',
    source: 'theathletic.com',
    journalist: 'David Ornstein',
    predictedStatus: 'ADVANCED_TALKS',
    confidence: 0.61,
    reason: 'Unmatched player entity & low confidence classification',
    duplicateCandidate: 'Real Madrid track £60m wonderkid',
  },
];

export default function HumanReviewQueuePage() {
  const [items, setItems] = useState<ReviewQueueItem[]>(mockReviewItems);
  const [resolvedCount, setResolvedCount] = useState(0);

  function handleApprove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setResolvedCount((c) => c + 1);
  }

  function handleCorrect(id: string, newStatus: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setResolvedCount((c) => c + 1);
  }

  return (
    <div className="min-h-screen pb-24 bg-bg text-text font-sans">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400">
            <AlertTriangle className="h-3.5 w-3.5" /> Human Review Queue
          </div>
        </div>

        <section className="glass-panel rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-cyan">
            <ShieldCheck className="h-4 w-4" />
            <span>Editorial Quality Control</span>
          </div>

          <h1 className="mt-2 font-display text-3xl font-extrabold text-text">
            Human Review <span className="text-accent-emerald">Queue</span>
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            Audit low-confidence ML predictions, missing author bylines, unmatched entities, and duplicate group suggestions.
          </p>

          <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-muted pt-3 border-t border-white/10">
            <div>Pending Items: <strong className="text-accent-rose">{items.length}</strong></div>
            <div>Resolved Today: <strong className="text-accent-emerald">{resolvedCount}</strong></div>
          </div>
        </section>

        <div className="space-y-4">
          {items.length ? (
            items.map((item) => (
              <div key={item.id} className="glass-card rounded-3xl p-6 space-y-4 border border-rose-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{item.reason}</span>
                  </div>
                  <div className="text-xs text-muted">
                    Predicted: <strong className="text-text uppercase">{item.predictedStatus}</strong> ({Math.round(item.confidence * 100)}%)
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-muted uppercase">
                    {item.source} • {item.journalist || 'Missing Journalist'}
                  </span>
                  <h3 className="font-display text-lg font-bold text-text mt-1">{item.headline}</h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{item.description}</p>
                </div>

                {item.duplicateCandidate && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-accent-amber" />
                      <span>Duplicate Candidate: <strong>&quot;{item.duplicateCandidate}&quot;</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApprove(item.id)}
                        className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/30"
                      >
                        Merge Group
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-muted mr-1">Correct Label:</span>
                    {['OFFICIAL', 'BID_SUBMITTED', 'NEGOTIATIONS', 'INTEREST', 'NOT_TRANSFER'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleCorrect(item.id, st)}
                        className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-text hover:bg-white/10"
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApprove(item.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-accent-emerald px-4 py-2 text-xs font-bold text-slate-950 shadow-emeraldGlow hover:bg-emerald-400"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve Prediction
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel rounded-3xl p-8 text-center space-y-3">
              <ShieldCheck className="mx-auto h-12 w-12 text-accent-emerald" />
              <h3 className="font-display text-xl font-bold text-text">Review Queue Clear!</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                No low-confidence predictions or unverified entity reports require review at this moment.
              </p>
            </div>
          )}
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
