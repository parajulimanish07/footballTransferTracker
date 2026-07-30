import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-3xl font-semibold text-text">Page not found</h1>
        <p className="mt-3 text-sm text-muted">The requested transfer report or club page could not be found.</p>
        <Link className="mt-6 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-text hover:bg-white/8" href="/dashboard">Back to dashboard</Link>
      </div>
    </main>
  );
}