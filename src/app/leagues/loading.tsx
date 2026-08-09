export default function LeaguesLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6 animate-pulse">
      <div className="h-32 rounded-2xl bg-slate-900 border border-slate-800" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="h-48 rounded-xl bg-slate-900 border border-slate-800" />
        <div className="h-48 rounded-xl bg-slate-900 border border-slate-800" />
      </div>
    </div>
  );
}
