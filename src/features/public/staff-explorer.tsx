"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SmartImage } from "@/components/media/smart-image";
import { FilterChips, type FilterOption } from "@/components/ui/filter-chips";
import { initials } from "@/lib/utils";

export interface StaffEntry {
  id: string;
  full_name: string;
  position: string | null;
  department: string | null;
  bio: string | null;
  photo_url: string | null;
  photo_w: number | null;
  photo_h: number | null;
  is_leadership: boolean;
}

export function StaffExplorer({ staff }: { staff: StaffEntry[] }) {
  const [group, setGroup] = useState("all");

  const departments = useMemo(() => {
    const set = new Set<string>();
    staff.forEach((s) => s.department && set.add(s.department));
    return Array.from(set);
  }, [staff]);

  const options: FilterOption[] = [
    { value: "all", label: "Everyone", count: staff.length },
    { value: "leadership", label: "Leadership", count: staff.filter((s) => s.is_leadership).length },
    { value: "team", label: "Teachers & Staff", count: staff.filter((s) => !s.is_leadership).length },
    ...departments.map((d) => ({ value: `dept:${d}`, label: d, count: staff.filter((s) => s.department === d).length })),
  ];

  const filtered = useMemo(
    () =>
      staff.filter((s) => {
        if (group === "all") return true;
        if (group === "leadership") return s.is_leadership;
        if (group === "team") return !s.is_leadership;
        if (group.startsWith("dept:")) return s.department === group.slice(5);
        return true;
      }),
    [staff, group]
  );

  return (
    <div>
      <div className="mb-10 flex justify-center">
        <FilterChips options={options} value={group} onChange={setGroup} layoutId="staff-group" size="sm" />
      </div>
      <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((s, i) => (
            <motion.div
              layout
              key={s.id}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 300, damping: 28, delay: (i % 8) * 0.04 }}
              className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-brand-100 transition hover:-translate-y-1.5 hover:shadow-xl"
            >
              {s.photo_url ? (
                <SmartImage src={s.photo_url} alt={s.full_name} width={s.photo_w} height={s.photo_h} aspect="4 / 5" rounded={false} sizes="(max-width:768px) 50vw, 25vw" />
              ) : (
                <div className="grid aspect-[4/5] place-items-center bg-gradient-to-br from-brand-100 to-brand-50">
                  <span className="font-display text-4xl font-extrabold text-brand-400">{initials(s.full_name)}</span>
                </div>
              )}
              <div className="p-5">
                {s.is_leadership && <span className="mb-2 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-600">Leadership</span>}
                <h3 className="font-display text-lg font-bold text-ink">{s.full_name}</h3>
                <p className="text-sm font-semibold text-brand-600">{s.position}</p>
                {s.bio && <p className="mt-2 line-clamp-3 text-sm text-muted">{s.bio}</p>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
