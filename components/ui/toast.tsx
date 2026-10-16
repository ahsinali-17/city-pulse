"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

type ToastListener = (toast: ToastMessage) => void;
const listeners = new Set<ToastListener>();

export const toast = {
  success: (message: string) => emitToast(message, "success"),
  error: (message: string) => emitToast(message, "error"),
  info: (message: string) => emitToast(message, "info"),
};

function emitToast(message: string, type: ToastType = "info") {
  const newToast: ToastMessage = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type,
    message,
  };
  listeners.forEach((listener) => listener(newToast));
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleNewToast = (toastMsg: ToastMessage) => {
      setToasts((prev) => [...prev, toastMsg]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastMsg.id));
      }, 4000);
    };

    listeners.add(handleNewToast);
    return () => {
      listeners.delete(handleNewToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg shadow-lg border text-xs transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
            t.type === "error"
              ? "bg-red-950/95 text-red-100 border-red-800"
              : t.type === "success"
              ? "bg-emerald-950/95 text-emerald-100 border-emerald-800"
              : "bg-slate-900/95 text-slate-100 border-slate-800"
          }`}
        >
          {t.type === "error" && (
            <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
          )}
          {t.type === "success" && (
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
          )}
          {t.type === "info" && (
            <Info className="size-4 text-blue-400 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 font-medium leading-relaxed">{t.message}</div>

          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="text-slate-400 hover:text-white transition-colors p-0.5"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
