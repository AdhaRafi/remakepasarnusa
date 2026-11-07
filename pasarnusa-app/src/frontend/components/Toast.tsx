"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, "id">) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-2xl p-4 border shadow-artisan-lg flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-3 ${
              t.type === "success"
                ? "bg-white border-[#246E4A]/30 text-[#1A1008]"
                : t.type === "error"
                ? "bg-white border-[#A82A2A]/30 text-[#1A1008]"
                : "bg-white border-[#DFD7CA] text-[#1A1008]"
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-[#246E4A]" />
              ) : t.type === "error" ? (
                <AlertCircle className="w-5 h-5 text-[#A82A2A]" />
              ) : (
                <Info className="w-5 h-5 text-[#B8872A]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold leading-snug">{t.title}</h4>
              {t.message && (
                <p className="text-xs text-[#6E6254] mt-0.5 leading-relaxed">
                  {t.message}
                </p>
              )}
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action?.onClick();
                    removeToast(t.id);
                  }}
                  className="mt-2 text-xs font-bold text-[#C94B1A] hover:underline block"
                >
                  {t.action.label}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-[#6E6254] hover:text-[#1A1008] p-1 rounded-lg transition"
              aria-label="Tutup Notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
