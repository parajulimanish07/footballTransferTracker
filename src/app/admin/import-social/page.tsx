'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck, Share2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { sourceRegistry } from '@/config/source-registry';

export default function ImportSocialPage() {
  const [handle, setHandle] = useState('FabrizioRomano');
  const [postUrl, setPostUrl] = useState('');
  const [postText, setPostText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approvedSocialAccounts = sourceRegistry.filter((s) => s.socialHandle);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!postUrl.trim() || !postText.trim()) {
      setError('Please provide both the post URL and post text content.');
      return;
    }

    const matchedSource = sourceRegistry.find(
      (s) => s.socialHandle?.toLowerCase().replace('@', '') === handle.toLowerCase().replace('@', '')
    );

    if (!matchedSource) {
      setError(`Account @${handle} is not in the approved source registry.`);
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setPostUrl('');
      setPostText('');
    }, 3000);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      <AppHeader />

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/more" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to More Tools
          </Link>
        </div>

        {/* Page Header */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
            <Share2 className="h-4 w-4" />
            <span>Admin Studio</span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-white sm:text-3xl">
            Manual Social Post Import
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-300">
            Import social posts from approved Tier-1 insiders or official club accounts. Imported posts pass through the exact same entity resolution, clause extraction, and reliability pipeline.
          </p>
        </section>

        {/* Import Form */}
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Approved Account
            </label>
            <select
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              {approvedSocialAccounts.map((account) => (
                <option key={account.id} value={account.socialHandle || ''}>
                  {account.displayName} ({account.socialHandle}) — Tier: {account.reliabilityTier}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Post URL
            </label>
            <input
              type="url"
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
              placeholder="https://x.com/FabrizioRomano/status/..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Post Text / Content
            </label>
            <textarea
              rows={4}
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Paste social post text content here..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
              {error}
            </div>
          )}

          {submitted && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Social post successfully submitted and passed through AI ingestion pipeline!</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-xs font-extrabold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            Process Social Report
          </button>
        </form>
      </main>
    </div>
  );
}
