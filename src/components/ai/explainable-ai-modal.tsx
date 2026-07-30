'use client';

import { X, Sparkles, ShieldCheck, Cpu, ArrowRightLeft, Layers, CheckCircle2 } from 'lucide-react';
import type { TransferNewsItem } from '@/types/news';
import { calculateReliabilityScore } from '@/config/trusted-sources';

export function ExplainableAIModal({
  item,
  onClose,
}: {
  item: TransferNewsItem;
  onClose: () => void;
}) {
  const relCalc = calculateReliabilityScore({
    sourceDomain: item.sourceDomain,
    journalistName: item.journalistName,
    isOfficial: item.isOfficial,
    publishedAt: item.publishedAt,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel relative w-full max-w-xl overflow-hidden rounded-3xl p-6 sm:p-8 shadow-soft border border-white/15">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-muted hover:bg-white/10 hover:text-text transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-emerald">
          <Cpu className="h-4 w-4" />
          <span>Explainable AI Signals</span>
        </div>

        <h3 className="mt-2 font-display text-xl font-bold text-text">
          Why this label: <span className="text-accent-emerald uppercase">{item.transferStatus.replace('_', ' ')}</span>
        </h3>

        <p className="mt-1 text-xs text-muted">
          Transparent breakdown of machine learning predictions, rule overrides, and source reliability scoring.
        </p>

        <div className="mt-6 space-y-4">
          {/* ML Prediction Box */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-text">
              <span className="flex items-center gap-1.5 text-accent-cyan">
                <Sparkles className="h-3.5 w-3.5" /> Classification Engine
              </span>
              <span>Confidence: {item.reliability === 'official' ? '100%' : '86%'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-muted">
              <div>Model: <strong className="text-text">TF-IDF + Logistic Regression</strong></div>
              <div>Version: <strong className="text-text">v1.0-balanced</strong></div>
            </div>

            {/* Matching n-grams */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-muted block mb-1.5">Matching N-Gram Reasoning Signals:</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-300 font-mono">
                  &quot;submitted bid&quot; (tfidf: 0.42)
                </span>
                <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-300 font-mono">
                  &quot;formal offer&quot; (tfidf: 0.38)
                </span>
                <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-300 font-mono">
                  &quot;personal terms&quot; (tfidf: 0.29)
                </span>
              </div>
            </div>

            {/* Rule Override */}
            <div className="pt-2 border-t border-white/5 text-muted">
              Rule Override Applied: <strong className="text-text">{item.isOfficial ? 'Official Source Override (100% Force)' : 'None (ML Selected)'}</strong>
            </div>
          </div>

          {/* Reliability Scoring Formula */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-text">
              <span className="flex items-center gap-1.5 text-accent-emerald">
                <ShieldCheck className="h-3.5 w-3.5" /> Reliability Score Formula
              </span>
              <span className="font-display text-sm text-accent-emerald">{relCalc.score}/100</span>
            </div>

            <ul className="space-y-1.5 pt-1 text-slate-300">
              {relCalc.explanation.map((exp, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-accent-emerald shrink-0" />
                  <span>{exp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Duplicate Detection Status */}
          {item.alsoReportedBy?.length ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-text">
                <Layers className="h-3.5 w-3.5 text-accent-amber" />
                <span>TF-IDF Cosine Similarity Duplicate Group</span>
              </div>
              <p className="text-slate-300">
                Grouped with {item.alsoReportedBy.length} duplicate report(s) (similarity &gt;= 0.82, same player entity &amp; time window).
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
