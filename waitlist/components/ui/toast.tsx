'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Instrument_Sans } from "next/font/google";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`${instrumentSans.className} pointer-events-auto px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border text-sm md:text-base min-w-[280px] max-w-[400px]`}
              style={{
                backgroundColor:
                  toast.type === "error"
                    ? "rgba(239, 68, 68, 0.15)"
                    : toast.type === "success"
                    ? "rgba(34, 197, 94, 0.15)"
                    : "rgba(59, 130, 246, 0.15)",
                borderColor:
                  toast.type === "error"
                    ? "rgba(239, 68, 68, 0.3)"
                    : toast.type === "success"
                    ? "rgba(34, 197, 94, 0.3)"
                    : "rgba(59, 130, 246, 0.3)",
                color:
                  toast.type === "error"
                    ? "#FCA5A5"
                    : toast.type === "success"
                    ? "#BBF7D0"
                    : "rgba(255, 255, 255, 0.9)",
              }}
              onClick={() => removeToast(toast.id)}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

