import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import clsx from "clsx";

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  push: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo(
    () => ({
      push: (message: string, tone: ToastTone = "info") => {
        const id = crypto.randomUUID?.() || Date.now().toString();
        setToasts((prev) => [...prev, { id, message, tone }]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3200);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              "rounded-xl border px-4 py-3 text-sm font-medium shadow-lg",
              toast.tone === "success" &&
                "border-emerald-200 bg-emerald-50 text-emerald-800",
              toast.tone === "error" && "border-red-200 bg-red-50 text-red-800",
              toast.tone === "info" &&
                "border-slate-200 bg-white text-slate-900",
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
