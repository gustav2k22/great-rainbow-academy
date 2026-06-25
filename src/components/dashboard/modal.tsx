"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const maxW = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:p-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`relative w-full ${maxW} rounded-3xl bg-white shadow-2xl`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-brand-100 px-6 py-5">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
                {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted transition hover:bg-brand-50 hover:text-ink" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
