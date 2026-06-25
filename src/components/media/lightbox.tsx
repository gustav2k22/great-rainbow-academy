"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Download, Maximize2, Minimize2, Play, X,
} from "lucide-react";
import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";
import { isVideo } from "@/lib/utils";

export interface LightboxMedia {
  url: string;
  type?: "image" | "video";
  alt?: string | null;
  caption?: string | null;
}

interface Ctx {
  open: (items: LightboxMedia[], index?: number) => void;
}
const LightboxContext = createContext<Ctx | null>(null);

export function useLightbox() {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error("useLightbox must be used within <LightboxProvider>");
  return ctx;
}

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<LightboxMedia[]>([]);
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(false);

  const open = useCallback((list: LightboxMedia[], i = 0) => {
    setItems(list);
    setIndex(i);
    setZoom(false);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);
  const next = useCallback(() => {
    setZoom(false);
    setIndex((i) => (i + 1) % items.length);
  }, [items.length]);
  const prev = useCallback(() => {
    setZoom(false);
    setIndex((i) => (i - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close, next, prev]);

  const ctx = useMemo(() => ({ open }), [open]);
  const current = items[index];
  const currentIsVideo = current ? current.type === "video" || isVideo(current.url) : false;

  return (
    <LightboxContext.Provider value={ctx}>
      {children}
      <AnimatePresence>
        {isOpen && current && (
          <motion.div
            className="fixed inset-0 z-[200] flex flex-col bg-black/92 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            {/* top bar */}
            <div
              className="flex items-center justify-between px-4 py-4 text-white/90 sm:px-8"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-sm font-medium tabular-nums">
                {index + 1} / {items.length}
              </span>
              <div className="flex items-center gap-1.5">
                {!currentIsVideo && (
                  <button
                    onClick={() => setZoom((z) => !z)}
                    className="rounded-full p-2.5 transition hover:bg-white/15"
                    aria-label={zoom ? "Zoom out" : "Zoom in"}
                  >
                    {zoom ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                  </button>
                )}
                <a
                  href={current.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="rounded-full p-2.5 transition hover:bg-white/15"
                  aria-label="Open original"
                >
                  <Download className="h-5 w-5" />
                </a>
                <button
                  onClick={close}
                  className="rounded-full p-2.5 transition hover:bg-white/15"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* stage */}
            <div
              className="relative flex flex-1 items-center justify-center overflow-hidden px-2 sm:px-16"
              onClick={(e) => e.stopPropagation()}
            >
              {items.length > 1 && (
                <button
                  onClick={prev}
                  className="absolute left-2 z-10 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/25 sm:left-6"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.url}
                  className="flex max-h-full max-w-full items-center justify-center"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                >
                  {currentIsVideo ? (
                    <video
                      src={current.url}
                      controls
                      autoPlay
                      playsInline
                      className="max-h-[78vh] max-w-[92vw] rounded-xl shadow-2xl"
                    />
                  ) : (
                    <motion.img
                      src={current.url}
                      alt={current.alt ?? ""}
                      drag={zoom}
                      dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
                      onDoubleClick={() => setZoom((z) => !z)}
                      animate={{ scale: zoom ? 2 : 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 25 }}
                      className={`max-h-[78vh] max-w-[92vw] rounded-xl object-contain shadow-2xl ${
                        zoom ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
                      }`}
                      draggable={false}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {items.length > 1 && (
                <button
                  onClick={next}
                  className="absolute right-2 z-10 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/25 sm:right-6"
                  aria-label="Next"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* caption + thumbnails */}
            <div className="px-4 pb-5 pt-2 sm:px-8" onClick={(e) => e.stopPropagation()}>
              {current.caption && (
                <p className="mb-3 text-center text-sm text-white/80">{current.caption}</p>
              )}
              {items.length > 1 && (
                <div className="hide-scrollbar mx-auto flex max-w-3xl gap-2 overflow-x-auto pb-1">
                  {items.map((it, i) => {
                    const v = it.type === "video" || isVideo(it.url);
                    return (
                      <button
                        key={it.url + i}
                        onClick={() => {
                          setZoom(false);
                          setIndex(i);
                        }}
                        className={`relative h-14 w-20 flex-none overflow-hidden rounded-lg ring-2 transition ${
                          i === index ? "ring-white" : "ring-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        {v ? (
                          <span className="flex h-full w-full items-center justify-center bg-brand-900">
                            <Play className="h-5 w-5 text-white" />
                          </span>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.url} alt="" className="h-full w-full object-cover" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LightboxContext.Provider>
  );
}
