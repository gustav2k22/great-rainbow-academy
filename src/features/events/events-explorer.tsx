"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, MapPin, CalendarX } from "lucide-react";
import { SmartImage } from "@/components/media/smart-image";
import { FilterChips, type FilterOption } from "@/components/ui/filter-chips";
import { formatDate } from "@/lib/utils";

export interface EventEntry {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  category: string | null;
  location: string | null;
  start_at: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  cover_w: number | null;
  cover_h: number | null;
}

export function EventsExplorer({ events }: { events: EventEntry[] }) {
  const now = Date.now();
  const [time, setTime] = useState("all");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => e.category && set.add(e.category));
    return Array.from(set);
  }, [events]);

  const isUpcoming = (e: EventEntry) => e.start_at && new Date(e.start_at).getTime() >= now;

  const timeOptions: FilterOption[] = [
    { value: "all", label: "All", count: events.length },
    { value: "upcoming", label: "Upcoming", count: events.filter(isUpcoming).length },
    { value: "past", label: "Past", count: events.filter((e) => !isUpcoming(e)).length },
  ];
  const categoryOptions: FilterOption[] = [
    { value: "all", label: "All Categories" },
    ...categories.map((c) => ({ value: c, label: c, count: events.filter((e) => e.category === c).length })),
  ];

  const filtered = useMemo(
    () =>
      events.filter((e) => {
        if (time === "upcoming" && !isUpcoming(e)) return false;
        if (time === "past" && isUpcoming(e)) return false;
        if (category !== "all" && e.category !== category) return false;
        return true;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, time, category]
  );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips options={timeOptions} value={time} onChange={setTime} layoutId="events-time" />
        {categories.length > 1 && (
          <FilterChips options={categoryOptions} value={category} onChange={setCategory} layoutId="events-cat" size="sm" />
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-muted">
          <CalendarX className="h-10 w-10 text-brand-300" />
          <p>No events match this filter.</p>
        </div>
      ) : (
        <motion.div layout className="grid gap-6 md:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((e, i) => (
              <motion.div
                layout
                key={e.id}
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 28, delay: (i % 6) * 0.05 }}
              >
                <Link href={`/events/${e.slug}`} className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-brand-100 transition hover:-translate-y-1.5 hover:shadow-xl">
                  <SmartImage src={e.cover_url} alt={e.cover_alt ?? e.title} width={e.cover_w} height={e.cover_h} aspect="16 / 10" rounded={false} sizes="(max-width:768px) 100vw, 33vw" />
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-600">{e.category}</span>
                      {e.start_at && <span className="inline-flex items-center gap-1 text-muted"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(e.start_at)}</span>}
                      {e.location && <span className="inline-flex items-center gap-1 text-muted"><MapPin className="h-3.5 w-3.5" /> {e.location}</span>}
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold text-ink">{e.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-muted">{e.summary}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                      Read more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
