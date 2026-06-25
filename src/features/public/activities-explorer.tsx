"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { FilterChips, type FilterOption } from "@/components/ui/filter-chips";

export interface ActivityEntry {
  id: string;
  title: string;
  kind: "indoor" | "outdoor";
  icon: string | null;
}

export function ActivitiesExplorer({ activities }: { activities: ActivityEntry[] }) {
  const [kind, setKind] = useState("all");

  const options: FilterOption[] = [
    { value: "all", label: "All", count: activities.length },
    { value: "indoor", label: "Indoor", count: activities.filter((a) => a.kind === "indoor").length },
    { value: "outdoor", label: "Outdoor", count: activities.filter((a) => a.kind === "outdoor").length },
  ];

  const filtered = useMemo(
    () => (kind === "all" ? activities : activities.filter((a) => a.kind === kind)),
    [activities, kind]
  );

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <FilterChips options={options} value={kind} onChange={setKind} layoutId="activities-kind" />
      </div>
      <motion.div layout className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((a, i) => (
            <motion.div
              layout
              key={a.id}
              initial={{ opacity: 0, scale: 0.9, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 320, damping: 26, delay: (i % 8) * 0.04 }}
              className="group flex flex-col items-center rounded-2xl border border-brand-100 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:scale-110">
                <Icon name={a.icon} className="h-7 w-7" />
              </span>
              <h4 className="mt-4 text-sm font-bold text-ink">{a.title}</h4>
              <span className="mt-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-500">{a.kind}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
