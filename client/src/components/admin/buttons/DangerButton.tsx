import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface DangerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const DangerButton = forwardRef<HTMLButtonElement, DangerButtonProps>(
  ({ className, children, loading, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg",
          "text-sm font-semibold text-white",
          "bg-red-600",
          "hover:bg-red-700",
          "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-all duration-200",
          "shadow-sm hover:shadow-md",
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

DangerButton.displayName = "DangerButton";
