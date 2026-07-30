import Link from 'next/link';

export function EmptyNewsState() {
  return (
    <div className="glass-panel rounded-3xl p-8 text-center">
      <h3 className="text-lg font-semibold text-text">No transfer stories match your filters</h3>
      <p className="mt-2 text-sm text-muted">Try clearing one filter or follow more clubs to broaden the feed.</p>
      <div className="mt-5">
        <Link className="inline-flex h-10 items-center justify-center rounded-full bg-accent-blue px-4 text-sm font-medium text-white hover:bg-blue-400" href="/onboarding">
          Adjust clubs
        </Link>
      </div>
    </div>
  );
}