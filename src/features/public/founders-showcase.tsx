"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Slide {
  image: string;
  name: string;
  role: string;
}

/**
 * Auto-advancing founders carousel. The portraits are pre-enhanced with a
 * soft background blur so the subject pops; this adds an ambient blurred
 * backdrop and smooth slide transitions.
 */
export function FoundersShowcase({ slides: input }: { slides: Slide[] }) {
  const slides = input.filter((s) => s.image);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((dir: number) => setIndex((i) => (i + dir + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-[1.75rem] shadow-[0_30px_80px_-30px_rgba(76,29,149,0.5)] ring-1 ring-brand-100"
      style={{ aspectRatio: "4 / 5" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ambient blurred backdrop of the current slide */}
      <AnimatePresence>
        <motion.div
          key={`bg-${index}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            backgroundImage: `url(${slides[index].image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(28px) brightness(0.8) saturate(1.1)",
            transform: "scale(1.2)",
          }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-brand-900/10" />

      {/* main image */}
      <AnimatePresence mode="popLayout">
        <motion.img
          key={slides[index].image}
          src={slides[index].image}
          alt={slides[index].name}
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          draggable={false}
        />
      </AnimatePresence>

      {/* caption */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6 pt-16">
        <motion.div key={`cap-${index}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <p className="font-display text-xl font-extrabold text-white">{slides[index].name}</p>
          <p className="text-sm font-semibold text-brand-200">{slides[index].role}</p>
        </motion.div>
      </div>

      {/* controls */}
      {slides.length > 1 && (
        <>
          <button onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-brand-700 shadow-lg transition hover:bg-white" aria-label="Previous">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-brand-700 shadow-lg transition hover:bg-white" aria-label="Next">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute left-1/2 top-4 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
