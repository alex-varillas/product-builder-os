"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { springSoft } from "@/lib/motion";

type ToastKind = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const KIND_STYLES: Record<ToastKind, { bg: string; color: string; border: string }> = {
  success: { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
  error:   { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  info:    { bg: "#FAFAF8", color: "#6B6760", border: "#E2DDD4" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
        <AnimatePresence>
          {toasts.map((t) => {
            const s = KIND_STYLES[t.kind];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: springSoft }}
                exit={{ opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.18 } }}
                style={{
                  background: s.bg,
                  color: s.color,
                  border: `1px solid ${s.border}`,
                  borderRadius: 10,
                  padding: "9px 14px",
                  fontSize: 13,
                  fontWeight: 450,
                  letterSpacing: "-0.01em",
                  boxShadow: "0 4px 16px rgba(26,23,20,0.08)",
                  whiteSpace: "nowrap",
                  cursor: "default",
                  userSelect: "none",
                }}
              >
                {t.message}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
