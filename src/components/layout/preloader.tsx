"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const RAINBOW = ["#ef4444", "#f97316", "#facc15", "#22c55e", "#3b82f6", "#8b5cf6"];

export function Preloader({ logoUrl, schoolName }: { logoUrl?: string | null; schoolName: string }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("gra_preloaded")) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => {
      setShow(false);
      try {
        sessionStorage.setItem("gra_preloaded", "1");
      } catch {}
    }, 1900);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
        >
          {/* soft rainbow aura */}
          <motion.div
            className="absolute h-72 w-72 rounded-full blur-3xl"
            style={{ background: "conic-gradient(from 0deg, #ef4444,#f97316,#facc15,#22c55e,#3b82f6,#8b5cf6,#ef4444)" }}
            animate={{ rotate: 360, opacity: [0.18, 0.32, 0.18] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />

          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 14 }}
            className="relative z-10 flex flex-col items-center"
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <motion.img
                src={logoUrl}
                alt={schoolName}
                className="h-24 w-24 rounded-2xl object-contain drop-shadow-xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : (
              <div className="text-5xl">🌈</div>
            )}
            <p className="mt-5 font-display text-lg font-extrabold tracking-tight text-ink">
              {schoolName}
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-brand-500">
              The Citadel of Learning
            </p>
          </motion.div>

          {/* rainbow loading bar */}
          <div className="relative z-10 mt-8 flex gap-1.5">
            {RAINBOW.map((c, i) => (
              <motion.span
                key={c}
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: c }}
                animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
