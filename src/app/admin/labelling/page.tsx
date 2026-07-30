'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tag, Download, SkipForward, CheckCircle2, ShieldAlert, ArrowLeft, Key } from 'lucide-react';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/app-header';
import { MobileNavigation } from '@/components/layout/mobile-navigation';
import type { TransferStatus } from '@/types/news';

interface SampleArticle {
  id: string;
  headline: string;
  description: string;
  source: string;
  journalist: string;
  club: string;
  published_at: string;
}

const initialUnlabelled: SampleArticle[] = [
  {
    id: 'sample-101',
    headline: 'Arsenal agree £42m package for Calafiori after breakthrough talks',
    description: 'Arsenal have reached agreement with Bologna for defender Riccardo Calafiori.',
    source: 'theathletic.com',
    journalist: 'David Ornstein',
    club: 'Arsenal',
    published_at: '2026-07-28T14:00:00Z',
  },
  {
    id: 'sample-102',
    headline: 'Liverpool lodge initial enquiry for Koopmeiners with Atalanta',
    description: 'Liverpool have registered an enquiry with Atalanta regarding midfielder Teun Koopmeiners.',
    source: 'thetimes.com',
    journalist: 'Paul Joyce',
    club: 'Liverpool',
    published_at: '2026-07-28T16:20:00Z',
  },
  {
    id: 'sample-103',
    headline: 'Real Madrid officially announce completion of Santiago Bernabeu expansion',
    description: 'Real Madrid C.F. have completed the major renovation project at their home stadium.',
    source: 'realmadrid.com',
    journalist: 'Official',
    club: 'Real Madrid',
    published_at: '2026-07-28T18:00:00Z',
  },
  {
    id: 'sample-104',
    headline: 'Chelsea submit £50m proposal for striker Victor Osimhen',
    description: 'Chelsea have presented an official proposal to Napoli for Victor Osimhen.',
    source: 'skysports.com',
    journalist: 'Kaveh Solhekol',
    club: 'Chelsea',
    published_at: '2026-07-28T19:40:00Z',
  },
];

const STATUS_OPTIONS: Array<{ label: string; value: string; key: string }> = [
  { label: 'OFFICIAL', value: 'OFFICIAL', key: '1' },
  { label: 'AGREEMENT_REACHED', value: 'AGREEMENT_REACHED', key: '2' },
  { label: 'ADVANCED_TALKS', value: 'ADVANCED_TALKS', key: '3' },
  { label: 'NEGOTIATIONS', value: 'NEGOTIATIONS', key: '4' },
  { label: 'BID_SUBMITTED', value: 'BID_SUBMITTED', key: '5' },
  { label: 'APPROACH_MADE', value: 'APPROACH_MADE', key: '6' },
  { label: 'INTEREST', value: 'INTEREST', key: '7' },
  { label: 'DEPARTURE_EXPECTED', value: 'DEPARTURE_EXPECTED', key: '8' },
  { label: 'NOT_TRANSFER_NEWS', value: 'NOT_TRANSFER_NEWS', key: '9' },
];

export default function LabellingPage() {
  const [queue, setQueue] = useState<SampleArticle[]>(initialUnlabelled);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [labelled, setLabelled] = useState<Array<SampleArticle & { label: string }>>([]);

  const currentItem = queue[currentIndex];

  const handleAssignLabel = useCallback((statusLabel: string) => {
    if (!currentItem) return;

    setLabelled((prev) => [...prev, { ...currentItem, label: statusLabel }]);
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(queue.length);
    }
  }, [currentItem, currentIndex, queue.length]);

  const handleSkip = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, queue.length]);

  // Keyboard Shortcuts (Keys 1-9)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const match = STATUS_OPTIONS.find((opt) => opt.key === e.key);
      if (match) {
        handleAssignLabel(match.value);
      } else if (e.key.toLowerCase() === 's') {
        handleSkip();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAssignLabel, handleSkip]);

  function exportCSV() {
    if (!labelled.length) return;
    const headers = ['id', 'headline', 'description', 'source', 'journalist', 'club', 'published_at', 'label'];
    const rows = labelled.map((item) =>
      [
        item.id,
        `"${item.headline.replace(/"/g, '""')}"`,
        `"${item.description.replace(/"/g, '""')}"`,
        item.source,
        item.journalist,
        item.club,
        item.published_at,
        item.label,
      ].join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `labelled_transfer_dataset_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="min-h-screen pb-24 bg-bg text-text font-sans">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-accent-amber">
            <ShieldAlert className="h-3.5 w-3.5" /> Protected Development Interface
          </div>
        </div>

        <section className="glass-panel rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-emerald">
            <Tag className="h-4 w-4" />
            <span>Human-in-the-Loop Dataset Labelling</span>
          </div>

          <h1 className="mt-2 font-display text-3xl font-extrabold text-text">
            Data-Labelling <span className="text-accent-emerald">Workbench</span>
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            Review incoming news reports and assign supervised transfer-status labels. Export labelled samples to retrain the Python ML model.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted pt-3 border-t border-white/10">
            <div>Total Queue: <strong className="text-text">{queue.length}</strong></div>
            <div>Progress: <strong className="text-accent-emerald">{labelled.length} / {queue.length}</strong></div>
            <div className="flex items-center gap-1 text-accent-cyan">
              <Key className="h-3.5 w-3.5" /> Shortcuts active: Press 1-9 to label, [S] to skip
            </div>
          </div>
        </section>

        {currentItem ? (
          <div className="glass-card rounded-3xl p-6 space-y-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-cyan">
                {currentItem.source} • {currentItem.journalist} • {currentItem.club}
              </span>
              <h2 className="mt-2 font-display text-xl font-bold text-text">{currentItem.headline}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{currentItem.description}</p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <span className="text-xs font-bold text-muted block mb-3">Select Ground-Truth Label (Click or press key 1-9):</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleAssignLabel(opt.value)}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-text hover:bg-accent-emerald hover:text-slate-950 transition-all active:scale-95"
                  >
                    <span>{opt.label}</span>
                    <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-muted">[{opt.key}]</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleSkip}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-muted hover:text-text hover:bg-white/10 transition-colors"
              >
                <SkipForward className="h-3.5 w-3.5" /> Skip Article [S]
              </button>

              <span className="text-xs text-muted">Article {currentIndex + 1} of {queue.length}</span>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-8 text-center space-y-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-accent-emerald" />
            <h3 className="font-display text-xl font-bold text-text">All Queue Items Labelled!</h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              You have completed labelling all queued items. Export the CSV dataset to retrain your ML classifier.
            </p>
            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-emerald px-5 py-2.5 text-xs font-bold text-slate-950 shadow-emeraldGlow hover:bg-emerald-400 transition-all"
            >
              <Download className="h-4 w-4" /> Export Labelled CSV Dataset ({labelled.length} items)
            </button>
          </div>
        )}

        {labelled.length > 0 && currentItem ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-xl border border-accent-emerald/30 bg-accent-emerald/10 px-4 py-2 text-xs font-bold text-accent-emerald hover:bg-accent-emerald hover:text-slate-950 transition-all"
            >
              <Download className="h-3.5 w-3.5" /> Export Labelled CSV ({labelled.length})
            </button>
          </div>
        ) : null}
      </main>

      <MobileNavigation />
    </div>
  );
}
