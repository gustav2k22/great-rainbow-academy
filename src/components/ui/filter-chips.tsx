"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

/**
 * Animated segmented filter. The active background pill slides between
 * options with a shared layoutId for a smooth, premium feel.
 */
export function FilterChips({
  options,
  value,
  onChange,
  layoutId = "filter-pill",
  className,
  size = "md",
}: {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  layoutId?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative rounded-full font-bold transition-colors",
              size === "sm" ? "px-3.5 py-1.5 text-xs" : "px-4 py-2 text-sm",
              active ? "text-white" : "text-ink/70 ring-1 ring-brand-100 hover:text-brand-700"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-full bg-brand-600 shadow-[0_8px_20px_-8px_rgba(124,58,237,0.7)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {opt.label}
              {typeof opt.count === "number" && (
                <span className={cn("rounded-full px-1.5 text-[10px] font-bold tabular-nums", active ? "bg-white/25" : "bg-brand-50 text-brand-500")}>
                  {opt.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
