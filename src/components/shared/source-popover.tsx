export function SourcePopover({ sourceName, sourceDomain, journalistName }: { sourceName: string; sourceDomain: string; journalistName: string | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-xs text-muted">
      <p className="font-medium text-text">{sourceName}</p>
      <p>{sourceDomain}</p>
      {journalistName ? <p>{journalistName}</p> : <p>Official source</p>}
    </div>
  );
}