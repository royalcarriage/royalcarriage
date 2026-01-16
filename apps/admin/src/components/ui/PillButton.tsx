import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  loading?: boolean;
}

export function PillButton({
  variant = "primary",
  children,
  loading,
  className,
  ...rest
}: PillButtonProps) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors border";
  const styles: Record<Variant, string> = {
    primary:
      "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300",
    secondary:
      "bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:text-slate-400",
    danger:
      "bg-red-600 text-white border-red-600 hover:bg-red-700 disabled:bg-red-300",
    ghost:
      "bg-transparent text-slate-700 border-transparent hover:border-slate-200 hover:bg-slate-50",
  };

  return (
    <button
      className={clsx(base, styles[variant], className)}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && <span className="h-2 w-2 animate-ping rounded-full bg-white" />}
      {children}
    </button>
  );
}
