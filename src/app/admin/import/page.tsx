'use client';

import { useState } from 'react';
import { PlusCircle, ShieldCheck, ArrowLeft, CheckCircle2, AlertTriangle, Link2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/app-header';
import { MobileNavigation } from '@/components/layout/mobile-navigation';

export default function ManualImportPage() {
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [publisher, setPublisher] = useState('');
  const [journalist, setJournalist] = useState('');
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 16));
  const [playerName, setPlayerName] = useState('');
  const [currentClub, setCurrentClub] = useState('');
  const [destinationClub, setDestinationClub] = useState('');
  const [suggestedStatus, setSuggestedStatus] = useState('INTEREST');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Front-end validation checks
    if (!headline.trim() || !description.trim() || !sourceUrl.trim() || !publisher.trim()) {
      setError('Please fill in all required fields (Headline, Summary, Original URL, Publisher).');
      return;
    }

    try {
      new URL(sourceUrl);
    } catch {
      setError('Please enter a valid URL (including http:// or https://).');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline,
          description,
          sourceUrl,
          publisher,
          journalist: journalist || null,
          publishedAt,
          playerName: playerName || null,
          currentClub: currentClub || null,
          destinationClub: destinationClub || null,
          suggestedStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit article');
      }

      setSuccess(`Article successfully imported! Saved with external ID: ${data.id}. Passed through ML & reliability pipeline.`);
      setHeadline('');
      setDescription('');
      setSourceUrl('');
      setJournalist('');
      setPlayerName('');
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pb-24 bg-bg text-text font-sans">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-emerald/30 bg-accent-emerald/10 px-3 py-1 text-xs font-semibold text-accent-emerald shadow-emeraldGlow">
            <ShieldCheck className="h-3.5 w-3.5" /> Trusted Article Import
          </div>
        </div>

        <section className="glass-panel rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-emerald">
            <PlusCircle className="h-4 w-4" />
            <span>Manual Ingestion Pipeline</span>
          </div>

          <h1 className="mt-2 font-display text-3xl font-extrabold text-text">
            Import Trusted <span className="text-accent-emerald">Transfer Report</span>
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            Submit verified reports from tier-1 journalists or official statements. Submitted articles pass through the same ML, reliability, duplicate-detection, and review pipeline as automated feeds.
          </p>
        </section>

        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="space-y-4">
            <h3 className="font-display font-bold text-base text-text border-b border-white/10 pb-2">
              Report Metadata &amp; Attribution
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Headline *</label>
              <input
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g., Arsenal agree £42m deal for defender Riccardo Calafiori"
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 text-xs text-text placeholder:text-muted focus:border-accent-emerald focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Short Summary / Trail Text * (Full body text prohibited)</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short editorial summary or official announcement excerpt..."
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 text-xs text-text placeholder:text-muted focus:border-accent-emerald focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Original Article URL *</label>
                <input
                  required
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://theathletic.com/article/..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 text-xs text-text placeholder:text-muted focus:border-accent-emerald focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Publisher / Source Name *</label>
                <input
                  required
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="e.g., The Athletic, BBC Sport, Liverpool FC Official"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 text-xs text-text placeholder:text-muted focus:border-accent-emerald focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Journalist / Author (Optional)</label>
                <input
                  value={journalist}
                  onChange={(e) => setJournalist(e.target.value)}
                  placeholder="e.g., David Ornstein, Paul Joyce"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 text-xs text-text placeholder:text-muted focus:border-accent-emerald focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Publication Date &amp; Time *</label>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 text-xs text-text focus:border-accent-emerald focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="font-display font-bold text-base text-text border-b border-white/10 pb-2">
              Transfer Entities &amp; Suggested Classification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Player Name</label>
                <input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="e.g., Riccardo Calafiori"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 text-xs text-text focus:border-accent-emerald focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Current Club</label>
                <input
                  value={currentClub}
                  onChange={(e) => setCurrentClub(e.target.value)}
                  placeholder="e.g., Bologna"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 text-xs text-text focus:border-accent-emerald focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Destination Club</label>
                <input
                  value={destinationClub}
                  onChange={(e) => setDestinationClub(e.target.value)}
                  placeholder="e.g., Arsenal"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 text-xs text-text focus:border-accent-emerald focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Suggested Transfer Status</label>
              <select
                value={suggestedStatus}
                onChange={(e) => setSuggestedStatus(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 text-xs text-text focus:border-accent-emerald focus:outline-none"
              >
                <option value="OFFICIAL">OFFICIAL ANNOUNCEMENT</option>
                <option value="AGREEMENT_REACHED">AGREEMENT REACHED</option>
                <option value="ADVANCED_TALKS">ADVANCED TALKS</option>
                <option value="NEGOTIATIONS">NEGOTIATIONS</option>
                <option value="BID_SUBMITTED">BID SUBMITTED</option>
                <option value="APPROACH_MADE">APPROACH MADE</option>
                <option value="INTEREST">INTEREST</option>
                <option value="DEPARTURE_EXPECTED">DEPARTURE EXPECTED</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-emerald px-6 py-3 text-xs font-bold text-slate-950 shadow-emeraldGlow hover:bg-emerald-400 disabled:opacity-50 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{loading ? 'Validating & Processing...' : 'Submit & Process Report'}</span>
            </button>
          </div>
        </form>
      </main>

      <MobileNavigation />
    </div>
  );
}
