'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Bookmark, Share2, Check, User, HelpCircle } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { ReliabilityBadge } from '@/components/reliability/reliability-badge';
import { TransferStatusBadge } from '@/components/transfer/transfer-status-badge';
import { TransferDirectionBadge } from '@/components/transfer/transfer-direction-badge';
import { JournalistAvatar } from '@/components/shared/journalist-avatar';
import { ExplainableAIModal } from '@/components/ai/explainable-ai-modal';
import type { TransferNewsItem } from '@/types/news';

export function TransferNewsCard({ item }: { item: TransferNewsItem }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showExplainModal, setShowExplainModal] = useState(false);

  function toggleSave() {
    setSaved((prev) => !prev);
  }

  function copyLink() {
    navigator.clipboard.writeText(item.sourceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const movementText = [item.currentClub?.name, item.destinationClub?.name].filter(Boolean).join(' ➔ ');

  return (
    <>
      <article className="glass-card group relative overflow-hidden rounded-2xl p-5 sm:p-6">
        {/* Top Metadata Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <ReliabilityBadge level={item.reliability} />
            <TransferStatusBadge status={item.transferStatus} />
            <TransferDirectionBadge direction={item.direction} />
            
            <button
              type="button"
              onClick={() => setShowExplainModal(true)}
              className="inline-flex items-center gap-1 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-2.5 py-0.5 text-xs font-semibold text-accent-cyan hover:bg-accent-cyan hover:text-slate-950 transition-all"
            >
              <HelpCircle className="h-3 w-3" />
              <span>Why this label?</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={copyLink}
              title="Share / Copy Link"
              className="rounded-lg p-2 text-muted hover:bg-white/10 hover:text-text transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-accent-emerald" /> : <Share2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={toggleSave}
              title={saved ? 'Saved' : 'Save article'}
              className={`rounded-lg p-2 transition-colors ${
                saved ? 'text-accent-amber bg-amber-500/10' : 'text-muted hover:bg-white/10 hover:text-text'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${saved ? 'fill-accent-amber' : ''}`} />
            </button>
          </div>
        </div>

        {/* Main Editorial Headline */}
        <h2 className="mt-4 font-display text-lg font-bold leading-snug text-text group-hover:text-accent-emerald transition-colors sm:text-xl">
          {item.headline}
        </h2>

        {/* Article Summary */}
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-300">
          {item.summary}
        </p>

        {/* Player & Club Movement Strip */}
        {(item.playerName || movementText) && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-2.5 text-xs">
            {item.playerName && (
              <div className="flex items-center gap-1.5 font-semibold text-text">
                <User className="h-3.5 w-3.5 text-accent-cyan" />
                <span>{item.playerName}</span>
              </div>
            )}
            {item.playerName && movementText && <span className="text-white/20">•</span>}
            {movementText && (
              <div className="flex items-center gap-1.5 font-medium text-slate-300">
                <span>{movementText}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer Info & External Link */}
        <div className="mt-5 flex flex-col gap-3 pt-3 border-t border-white/5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <div className="flex items-center gap-2 font-medium text-text">
              <JournalistAvatar name={item.journalistName} />
              <span>{item.journalistName ?? 'Official Source'}</span>
            </div>
            <span>•</span>
            <span className="font-semibold text-slate-300">{item.sourceName}</span>
            <span>•</span>
            <span>{formatDistanceToNowStrict(new Date(item.publishedAt), { addSuffix: true })}</span>
          </div>

          <Link
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-accent-emerald/30 bg-accent-emerald/10 px-3.5 py-1.5 text-xs font-semibold text-accent-emerald hover:bg-accent-emerald hover:text-slate-950 transition-all shadow-sm"
          >
            <span>Read Report</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {item.alsoReportedBy?.length ? (
          <p className="mt-3 text-[11px] text-muted italic">
            Also verified by: {item.alsoReportedBy.join(', ')}
          </p>
        ) : null}

        {item.demo && (
          <span className="mt-2 block text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500">
            Demonstration report
          </span>
        )}
      </article>

      {showExplainModal && (
        <ExplainableAIModal item={item} onClose={() => setShowExplainModal(false)} />
      )}
    </>
  );
}