"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = true,
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/60 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-[#1a1a2e] dark:bg-[#1a1a2e] bg-white border border-purple-500/20 dark:border-purple-500/20 border-gray-200 rounded-2xl shadow-2xl shadow-black/50 dark:shadow-black/50 shadow-gray-500/20 w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
          danger ? "bg-red-500/15 dark:bg-red-500/15 bg-red-100" : "bg-yellow-500/15 dark:bg-yellow-500/15 bg-yellow-100"
        }`}>
          <AlertTriangle size={24} className={danger ? "text-red-400 dark:text-red-400 text-red-600" : "text-yellow-400 dark:text-yellow-400 text-yellow-600"} />
        </div>

        {/* Text */}
        <h2 className="text-lg font-semibold text-white dark:text-white text-gray-900 text-center mb-2">{title}</h2>
        {message && (
          <p className="text-gray-400 dark:text-gray-400 text-gray-600 text-sm text-center mb-6">{message}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 dark:bg-zinc-800 bg-gray-200 hover:bg-zinc-700 dark:hover:bg-zinc-700 hover:bg-gray-300 border border-zinc-700/50 dark:border-zinc-700/50 border-gray-300 text-gray-300 dark:text-gray-300 text-gray-700 hover:text-white dark:hover:text-white hover:text-gray-900 text-sm font-medium transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:shadow-lg ${
              danger
                ? "bg-red-600 hover:bg-red-500 hover:shadow-red-500/25"
                : "bg-yellow-600 hover:bg-yellow-500 hover:shadow-yellow-500/25"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

