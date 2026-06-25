"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { Input, Label } from "@/components/ui/field";
import { Panel } from "@/components/dashboard/ui";
import { ChannelPicker, type Channel } from "./channel-picker";
import { saveMessaging, sendTestNotification } from "./settings-actions";

interface EventPref { enabled: boolean; channels: Channel[]; ack_applicant?: boolean; welcome?: boolean }
interface Messaging {
  default_channels: Channel[];
  notify_emails: string[];
  notify_phones: string[];
  events: Record<string, EventPref>;
}

const EVENTS: { key: string; title: string; desc: string; extra?: { field: "ack_applicant" | "welcome"; label: string } }[] = [
  { key: "admission_submitted", title: "New admission application", desc: "Alert staff when a parent applies online.", extra: { field: "ack_applicant", label: "Also send a confirmation email to the applicant" } },
  { key: "contact_submitted", title: "New contact message", desc: "Alert staff when someone uses the contact form." },
  { key: "newsletter_subscribed", title: "New newsletter subscriber", desc: "When a visitor subscribes.", extra: { field: "welcome", label: "Send a welcome email to the new subscriber" } },
];

export function NotificationsSettings({
  initial,
  emailConfigured,
  smsConfigured,
}: {
  initial: Partial<Messaging>;
  emailConfigured: boolean;
  smsConfigured: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [testing, startTest] = useTransition();
  const [emails, setEmails] = useState((initial.notify_emails ?? []).join(", "));
  const [phones, setPhones] = useState((initial.notify_phones ?? []).join(", "));
  const [testTo, setTestTo] = useState("");
  const [events, setEvents] = useState<Record<string, EventPref>>(() => {
    const base: Record<string, EventPref> = {};
    EVENTS.forEach((e) => {
      const cur = initial.events?.[e.key];
      base[e.key] = { enabled: cur?.enabled ?? true, channels: cur?.channels ?? ["email"], ack_applicant: cur?.ack_applicant, welcome: cur?.welcome };
    });
    return base;
  });

  function setEvent(key: string, patch: Partial<EventPref>) {
    setEvents((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  function save() {
    const messaging: Messaging = {
      default_channels: ["email"],
      notify_emails: emails.split(",").map((s) => s.trim()).filter(Boolean),
      notify_phones: phones.split(",").map((s) => s.trim()).filter(Boolean),
      events,
    };
    startTransition(async () => {
      const res = await saveMessaging(messaging as unknown as Record<string, unknown>);
      if (res.ok) { toast.success("Notification settings saved"); router.refresh(); }
      else toast.error(res.message ?? "Could not save");
    });
  }

  function test() {
    if (!testTo.trim()) { toast.error("Enter an email or phone to test."); return; }
    const channel: Channel = testTo.includes("@") ? "email" : "sms";
    startTest(async () => {
      const res = await sendTestNotification(channel, testTo.trim());
      res.ok ? toast.success(res.message) : toast.error(res.message);
    });
  }

  return (
    <div className="space-y-6">
      <Panel>
        <h2 className="font-display text-lg font-bold text-ink">Where notifications go</h2>
        <p className="mt-1 text-sm text-muted">Staff alerts are sent to these recipients. Separate multiple with commas.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="nemails">Notification emails</Label><Input id="nemails" value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="admin@school.com, head@school.com" /></div>
          <div><Label htmlFor="nphones">Notification phones (SMS)</Label><Input id="nphones" value={phones} onChange={(e) => setPhones(e.target.value)} placeholder="+23324..., +23355..." /></div>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-50/60 p-3 text-xs">
          <span className={emailConfigured ? "text-rainbow-green" : "text-rainbow-orange"}>● Email {emailConfigured ? "configured" : "not configured"}</span>
          <span className={smsConfigured ? "text-rainbow-green" : "text-rainbow-orange"}>● SMS {smsConfigured ? "configured" : "not configured"}</span>
        </div>
      </Panel>

      {EVENTS.map((ev) => {
        const pref = events[ev.key];
        return (
          <Panel key={ev.key}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-ink">{ev.title}</h3>
                <p className="mt-0.5 text-sm text-muted">{ev.desc}</p>
              </div>
              <label className="flex flex-none items-center gap-2 text-sm font-semibold text-ink">
                <input type="checkbox" checked={pref.enabled} onChange={(e) => setEvent(ev.key, { enabled: e.target.checked })} className="h-4 w-4 accent-brand-600" />
                Enabled
              </label>
            </div>
            {pref.enabled && (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Send via</p>
                <ChannelPicker value={pref.channels} onChange={(c) => setEvent(ev.key, { channels: c })} emailConfigured={emailConfigured} smsConfigured={smsConfigured} />
                {pref.channels.length === 0 && <p className="text-xs text-rainbow-orange">No channel selected, this notification will not be delivered.</p>}
                {ev.extra && (
                  <label className="flex items-center gap-2.5 pt-1 text-sm text-ink">
                    <input type="checkbox" checked={!!pref[ev.extra.field]} onChange={(e) => setEvent(ev.key, { [ev.extra!.field]: e.target.checked })} className="h-4 w-4 accent-brand-600" />
                    {ev.extra.label}
                  </label>
                )}
              </div>
            )}
          </Panel>
        );
      })}

      <Panel>
        <h2 className="font-display text-lg font-bold text-ink">Send a test</h2>
        <p className="mt-1 text-sm text-muted">Enter an email (with @) or a phone number to send a test message.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@email.com or +23324..." className="sm:max-w-sm" />
          <button onClick={test} disabled={testing} className="inline-flex h-11 items-center gap-2 rounded-full border border-brand-200 px-5 text-sm font-bold text-brand-700 hover:bg-brand-50 disabled:opacity-70">
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send test
          </button>
        </div>
      </Panel>

      <div className="sticky bottom-4 flex justify-end">
        <button onClick={save} disabled={pending} className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-600 px-7 font-bold text-white shadow-lg transition hover:bg-brand-700 disabled:opacity-70">
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save Notification Settings
        </button>
      </div>
    </div>
  );
}
