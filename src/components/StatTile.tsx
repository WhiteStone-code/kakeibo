export default function StatTile({
  emoji,
  label,
  value,
  accent,
  sub,
}: {
  emoji: string;
  label: string;
  value: string;
  accent?: string;
  sub?: string;
}) {
  return (
    <div className="card p-4 flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center gap-2 text-soft text-xs font-bold uppercase tracking-wide">
        <span className="text-base">{emoji}</span>
        <span className="truncate">{label}</span>
      </div>
      <p
        className="font-display font-extrabold text-2xl truncate tabular-nums"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-soft">{sub}</p>}
    </div>
  );
}
