"use client";

import { Mail, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export type Channel = "email" | "sms";

/** Toggle email / SMS channels. Selecting neither = no delivery. */
export function ChannelPicker({
  value,
  onChange,
  emailConfigured,
  smsConfigured,
}: {
  value: Channel[];
  onChange: (next: Channel[]) => void;
  emailConfigured?: boolean;
  smsConfigured?: boolean;
}) {
  const toggle = (ch: Channel) =>
    onChange(value.includes(ch) ? value.filter((c) => c !== ch) : [...value, ch]);

  const Item = ({ ch, icon, label, configured }: { ch: Channel; icon: React.ReactNode; label: string; configured?: boolean }) => {
    const active = value.includes(ch);
    return (
      <button
        type="button"
        onClick={() => toggle(ch)}
        className={cn(
          "flex flex-1 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition",
          active ? "border-brand-500 bg-brand-50" : "border-brand-100 bg-white hover:border-brand-200"
        )}
      >
        <span className={cn("grid h-10 w-10 flex-none place-items-center rounded-xl", active ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-500")}>
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-ink">{label}</span>
          <span className={cn("block text-xs", configured ? "text-rainbow-green" : "text-rainbow-orange")}>
            {configured ? "Configured" : "Not configured"}
          </span>
        </span>
        <span className={cn("ml-auto h-5 w-5 flex-none rounded-md border-2", active ? "border-brand-600 bg-brand-600" : "border-brand-200")}>
          {active && (
            <svg viewBox="0 0 16 16" className="h-full w-full text-white" fill="none"><path d="M4 8.5l2.5 2.5L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          )}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Item ch="email" icon={<Mail className="h-5 w-5" />} label="Email" configured={emailConfigured} />
      <Item ch="sms" icon={<MessageSquare className="h-5 w-5" />} label="SMS" configured={smsConfigured} />
    </div>
  );
}
