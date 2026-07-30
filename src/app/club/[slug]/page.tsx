import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getClubBySlug } from '@/config/clubs';
import { getTransferNews } from '@/lib/news/get-transfer-news';
import { NewsFeed } from '@/components/news/news-feed';
import { TransferSummary } from '@/components/shared/transfer-summary';
import { AppHeader } from '@/components/layout/app-header';
import { MobileNavigation } from '@/components/layout/mobile-navigation';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const club = getClubBySlug(slug);
  return { title: club ? `${club.name} Transfer News | Verified Reports` : 'Club Transfer News' };
}

export default async function ClubPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const club = getClubBySlug(slug);
  if (!club) notFound();

  const response = await getTransferNews({ club: club.id, clubIds: [club.id], limit: 20 });

  return (
    <div className="min-h-screen pb-24">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <section className="glass-panel rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-cyan">
            <ShieldCheck className="h-4 w-4" />
            <span>{club.league}</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-text sm:text-4xl">
            {club.name} <span className="text-accent-emerald">Transfer Hub</span>
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl">
            {club.description}
          </p>
        </section>

        <TransferSummary arrivals={1} departures={1} targets={3} />

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section>
            <h2 className="mb-4 font-display text-lg font-bold text-text">Latest Verified Reports</h2>
            <NewsFeed items={response.data} />
          </section>

          <aside className="space-y-4">
            <div className="glass-card rounded-3xl p-5 text-xs text-slate-300 space-y-3">
              <p className="font-display font-bold text-sm text-text">Official Club Information</p>
              <p className="leading-relaxed">{club.description}</p>
              {club.websiteUrl && (
                <Link
                  className="inline-flex items-center gap-1 text-accent-emerald font-semibold hover:underline"
                  href={club.websiteUrl}
                  target="_blank"
                >
                  <span>Official Website</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </aside>
        </div>
      </main>
      <MobileNavigation />
    </div>
  );
}