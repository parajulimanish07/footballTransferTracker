'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ExternalLink, Bookmark, Share2, Check, User, Info } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { ReliabilityBadge } from '@/components/reliability/reliability-badge';
import { TransferStatusBadge } from '@/components/transfer/transfer-status-badge';
import { TransferDirectionBadge } from '@/components/transfer/transfer-direction-badge';
import type { TransferNewsItem } from '@/types/news';

// Dynamically load ExplainableAIModal ONLY when Details is clicked
const ExplainableAIModal = dynamic(
  () => import('@/components/ai/explainable-ai-modal').then((mod) => mod.ExplainableAIModal),
  { ssr: false }
);

export function TransferNewsCard({
  item,
  selectedClubId,
}: {
  item: TransferNewsItem;
  selectedClubId?: string | null;
}) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  function toggleSave() {
    setSaved((prev) => !prev);
  }

  function copyLink() {
    navigator.clipboard.writeText(item.sourceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isTransfer = item.transferStatus !== 'not_transfer_news';

  let movementText: string | null = null;
  if (isTransfer) {
    if (item.currentClub?.name && item.destinationClub?.name && item.currentClub.id !== item.destinationClub.id) {
      movementText = `${item.currentClub.name} ➔ ${item.destinationClub.name}`;
    } else if (item.destinationClub?.name) {
      movementText = `Linked with ${item.destinationClub.name}`;
    }
  }

  let directionBadge: 'incoming' | 'outgoing' | null = null;
  if (selectedClubId && isTransfer) {
    if (item.destinationClub?.id === selectedClubId) {
      directionBadge = 'incoming';
    } else if (item.currentClub?.id === selectedClubId) {
      directionBadge = 'outgoing';
    }
  }

  return (
    <>
      <article className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 text-slate-100 transition-colors hover:border-slate-700">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <ReliabilityBadge level={item.reliability} />
            <TransferStatusBadge status={item.transferStatus} />
            {directionBadge ? <TransferDirectionBadge direction={directionBadge} /> : null}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={copyLink}
              title="Share Link"
              className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={toggleSave}
              title={saved ? 'Saved' : 'Save article'}
              className={`rounded p-1.5 transition-colors ${
                saved ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Headline */}
        <h2 className="mt-3 font-display text-base sm:text-lg font-bold leading-snug text-white">
          {item.headline}
        </h2>

        {/* Short Summary */}
        <p className="mt-2 line-clamp-2 text-xs sm:text-sm leading-relaxed text-slate-300">{item.summary}</p>

        {/* Player & Linked Club Strip */}
        {isTransfer && (item.playerName || movementText) ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-800/80 bg-slate-950/60 px-3 py-2 text-xs">
            {item.playerName && (
              <div className="flex items-center gap-1.5 font-bold text-white">
                <User className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>{item.playerName}</span>
              </div>
            )}
            {item.playerName && (movementText || item.transferStatus) && <span className="text-slate-700 font-bold">•</span>}
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              {movementText ? (
                <span className="text-emerald-400 font-semibold">{movementText}</span>
              ) : (
                <span className="text-slate-400 font-medium italic">Transfer Target Reported</span>
              )}
            </div>
          </div>
        ) : null}

        {/* Footer Row */}
        <div className="mt-4 flex flex-col gap-2.5 pt-3 border-t border-slate-800/80 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">{item.sourceName}</span>
            <span>•</span>
            <span>{formatDistanceToNowStrict(new Date(item.publishedAt), { addSuffix: true })}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDetailsModal(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <Info className="h-3.5 w-3.5 text-cyan-400" />
              <span>Details</span>
            </button>

            <Link
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <span>Read Report</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </article>

      {/* Dynamically Loaded Details Modal */}
      {showDetailsModal && <ExplainableAIModal item={item} onClose={() => setShowDetailsModal(false)} />}
    </>
  );
}