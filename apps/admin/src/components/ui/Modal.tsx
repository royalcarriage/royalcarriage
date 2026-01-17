import type { ReactNode } from "react";
import { PillButton } from "./PillButton";

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  primaryAction?: { label: string; onClick: () => void; loading?: boolean };
}

export function Modal({
  open,
  title,
  children,
  onClose,
  primaryAction,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-4 py-4">{children}</div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3">
          <PillButton variant="ghost" onClick={onClose}>
            Cancel
          </PillButton>
          {primaryAction && (
            <PillButton
              onClick={primaryAction.onClick}
              loading={primaryAction.loading}
            >
              {primaryAction.label}
            </PillButton>
          )}
        </div>
      </div>
    </div>
  );
}
