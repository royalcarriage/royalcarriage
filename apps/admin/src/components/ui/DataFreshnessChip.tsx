import clsx from "clsx";
import type { FreshnessStatus } from "../../types";

export function DataFreshnessChip({ label, status, updatedAt }: FreshnessStatus) {
  const styles = {
    fresh: "bg-emerald-50 text-emerald-700 border-emerald-200",
    stale: "bg-amber-50 text-amber-700 border-amber-200",
    down: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
        styles[status],
      )}
    >
      <span
        className={clsx(
          "h-2 w-2 rounded-full",
          status === "fresh"
            ? "bg-emerald-500"
            : status === "stale"
              ? "bg-amber-500"
              : "bg-red-500",
        )}
      />
      <span>{label}</span>
      <span className="text-[11px] font-normal opacity-70">
        {new Date(updatedAt).toLocaleDateString()}
      </span>
    </div>
  );
}
