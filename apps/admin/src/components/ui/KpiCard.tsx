interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  tone?: "positive" | "negative" | "neutral";
}

export function KpiCard({
  label,
  value,
  delta,
  tone = "neutral",
}: KpiCardProps) {
  const color =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "negative"
        ? "text-red-600"
        : "text-slate-500";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      {delta && (
        <div className={`mt-1 text-xs font-semibold ${color}`}>{delta}</div>
      )}
    </div>
  );
}
