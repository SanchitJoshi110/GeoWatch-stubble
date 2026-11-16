// accentColor is a status marker colour; omit it for the neutral total card.
export default function KpiCard({ label, value, accentColor, hint }) {
  return (
    <div
      className="rounded-xl border border-outline-variant bg-surface-lowest p-5 shadow-sm"
      style={accentColor ? { borderTop: `2px solid ${accentColor}` } : undefined}
    >
      <div className="flex items-center justify-between text-sm font-medium text-outline">
        <span>{label}</span>
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accentColor ?? "#94A3B8" }} />
      </div>
      <div className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-outline">{hint}</div>}
    </div>
  );
}
