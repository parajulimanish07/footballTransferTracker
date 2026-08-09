import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { getNewsItemById } from '@/lib/news/get-transfer-news';
import { ReliabilityBadge } from '@/components/reliability/reliability-badge';
import { TransferStatusBadge } from '@/components/transfer/transfer-status-badge';
import { TransferDirectionBadge } from '@/components/transfer/transfer-direction-badge';

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getNewsItemById(id);
  if (!item) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <article className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <ReliabilityBadge level={item.reliability} />
          <TransferStatusBadge status={item.transferStatus} />
          <TransferDirectionBadge direction={item.direction} />
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-text">{item.headline}</h1>
        <p className="mt-4 text-sm leading-7 text-muted">{item.summary}</p>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">Player</dt><dd className="text-text">{item.playerName ?? 'Not specified'}</dd></div>
          <div><dt className="text-muted">Source</dt><dd className="text-text">{item.sourceName}</dd></div>
          <div><dt className="text-muted">Journalist</dt><dd className="text-text">{item.journalistName ?? 'Official source'}</dd></div>
          <div><dt className="text-muted">Published</dt><dd className="text-text">{formatDistanceToNowStrict(new Date(item.publishedAt), { addSuffix: true })}</dd></div>
        </dl>
        <div className="mt-6 flex gap-3">
          <Link className="rounded-full border border-white/10 px-4 py-2 text-sm text-text hover:bg-white/8" href={item.sourceUrl} target="_blank" rel="noreferrer">Open original source</Link>
        </div>
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-text">Timeline of related reports</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li className="rounded-2xl border border-white/10 bg-white/5 p-3">Initial demonstration report published.</li>
            <li className="rounded-2xl border border-white/10 bg-white/5 p-3">Follow-up confirmation or update from a trusted source.</li>
          </ul>
        </section>
      </article>
    </main>
  );
}