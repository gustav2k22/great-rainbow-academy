"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Send, Trash2, Pencil, Loader2, Save, Users } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/dashboard/modal";
import { Input, Label, Textarea } from "@/components/ui/field";
import { Panel, TableWrap, Th, Td, Pill, EmptyState, StatCard } from "@/components/dashboard/ui";
import { ChannelPicker, type Channel } from "./channel-picker";
import { saveNewsletter, deleteNewsletter, sendNewsletter, removeSubscriber } from "./comms-actions";
import { formatDate } from "@/lib/utils";

interface Campaign { id: string; subject: string; preview: string | null; body: string | null; status: string; sent_at: string | null; recipients: number | null; email_count?: number | null; sms_count?: number | null; created_at: string }
interface Subscriber { id: string; email: string; full_name: string | null; phone: string | null; status: string; created_at: string }

export function NewsletterManager({
  campaigns,
  subscribers,
  emailConfigured,
  smsConfigured,
}: {
  campaigns: Campaign[];
  subscribers: Subscriber[];
  emailConfigured: boolean;
  smsConfigured: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"campaigns" | "subscribers">("campaigns");
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState<Campaign | null>(null);
  const [channels, setChannels] = useState<Channel[]>(["email"]);
  const [pending, startTransition] = useTransition();

  const withPhone = subscribers.filter((s) => s.phone).length;

  function newCampaign() { setEditing(null); setOpen(true); }
  function edit(c: Campaign) { setEditing(c); setOpen(true); }
  function openSend(c: Campaign) { setSending(c); setChannels(["email"]); }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    startTransition(async () => {
      const res = await saveNewsletter(editing?.id ?? null, {
        subject: fd.get("subject") as string,
        preview: fd.get("preview") as string,
        body: fd.get("body") as string,
      });
      if (res.ok) { toast.success("Saved"); setOpen(false); router.refresh(); }
      else toast.error(res.message ?? "Error");
    });
  }
  function doSend() {
    if (!sending) return;
    if (channels.length === 0) { toast.error("Choose at least one channel, or close to cancel."); return; }
    const c = sending;
    startTransition(async () => {
      const res = await sendNewsletter(c.id, channels);
      if (res.ok) {
        const parts: string[] = [];
        if (res.channels?.includes("email")) parts.push(`${res.emailSent} email${res.emailSent === 1 ? "" : "s"}`);
        if (res.channels?.includes("sms")) parts.push(`${res.smsSent} SMS`);
        toast.success(`Campaign sent: ${parts.join(" + ") || "logged"}`);
        if (res.channels?.includes("email") && !res.emailConfigured) toast.warning("Email provider not configured. Add a Resend or SMTP key to deliver.");
        if (res.channels?.includes("sms") && !res.smsConfigured) toast.warning("SMS provider not configured. Add SMS credentials to deliver.");
        setSending(null);
        router.refresh();
      } else toast.error(res.message ?? "Error");
    });
  }
  function del(id: string) {
    if (!confirm("Delete this campaign?")) return;
    startTransition(async () => { const res = await deleteNewsletter(id); if (res.ok) { toast.success("Deleted"); router.refresh(); } else toast.error(res.message ?? "Error"); });
  }
  function unsub(id: string) {
    if (!confirm("Remove this subscriber?")) return;
    startTransition(async () => { const res = await removeSubscriber(id); if (res.ok) { toast.success("Removed"); router.refresh(); } else toast.error(res.message ?? "Error"); });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Subscribers" value={subscribers.length} icon={<Users className="h-6 w-6" />} accent="#6366f1" hint={`${withPhone} with phone for SMS`} />
        <StatCard label="Campaigns" value={campaigns.length} icon={<Send className="h-6 w-6" />} accent="#8b5cf6" />
        <StatCard label="Sent" value={campaigns.filter((c) => c.status === "published").length} icon={<Send className="h-6 w-6" />} accent="#22c55e" />
      </div>

      <div className="flex gap-2">
        {(["campaigns", "subscribers"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition ${tab === t ? "bg-brand-600 text-white" : "bg-white text-muted ring-1 ring-brand-100 hover:bg-brand-50"}`}>{t}</button>
        ))}
      </div>

      {tab === "campaigns" ? (
        <div>
          <div className="mb-4 flex justify-end">
            <button onClick={newCampaign} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700"><Plus className="h-4 w-4" /> New Campaign</button>
          </div>
          {campaigns.length === 0 ? (
            <EmptyState title="No campaigns yet" description="Create a newsletter to share updates with subscribers." icon={<Send className="h-6 w-6" />} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {campaigns.map((c) => (
                <Panel key={c.id} className="flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-bold text-ink">{c.subject}</h3>
                    <Pill tone={c.status === "published" ? "green" : "orange"}>{c.status === "published" ? "Sent" : "Draft"}</Pill>
                  </div>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">{c.preview || c.body}</p>
                  <p className="mt-2 text-xs text-muted">
                    {c.status === "published"
                      ? `Sent ${formatDate(c.sent_at)} · ${c.email_count ?? 0} email, ${c.sms_count ?? 0} SMS`
                      : `Created ${formatDate(c.created_at)}`}
                  </p>
                  <div className="mt-3 flex gap-1.5">
                    {c.status !== "published" && (
                      <>
                        <button onClick={() => openSend(c)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-sm font-semibold text-white hover:bg-brand-700"><Send className="h-3.5 w-3.5" /> Send</button>
                        <button onClick={() => edit(c)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-brand-200 px-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                      </>
                    )}
                    <button onClick={() => del(c.id)} className="ml-auto inline-flex h-9 items-center rounded-lg px-2.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </Panel>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {subscribers.length === 0 ? (
            <EmptyState title="No subscribers yet" description="People who subscribe on the website appear here." icon={<Users className="h-6 w-6" />} />
          ) : (
            <TableWrap>
              <thead className="border-b border-brand-100 bg-brand-50/40"><tr><Th>Email</Th><Th>Name</Th><Th>Phone</Th><Th>Status</Th><Th>Joined</Th><Th className="text-right">Actions</Th></tr></thead>
              <tbody className="divide-y divide-brand-50">
                {subscribers.map((s) => (
                  <tr key={s.id} className="transition hover:bg-brand-50/30">
                    <Td className="font-semibold text-ink">{s.email}</Td>
                    <Td>{s.full_name || "Not provided"}</Td>
                    <Td className="text-muted">{s.phone || "Not provided"}</Td>
                    <Td><Pill tone={s.status === "subscribed" ? "green" : "gray"}>{s.status}</Pill></Td>
                    <Td className="text-muted">{formatDate(s.created_at)}</Td>
                    <Td className="text-right"><button onClick={() => unsub(s.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Remove"><Trash2 className="h-4 w-4" /></button></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Campaign" : "New Campaign"} size="lg">
        <form onSubmit={onSave} className="space-y-4">
          <div><Label htmlFor="subject" required>Subject</Label><Input id="subject" name="subject" required defaultValue={editing?.subject ?? ""} /></div>
          <div><Label htmlFor="preview">Preview text</Label><Input id="preview" name="preview" defaultValue={editing?.preview ?? ""} /></div>
          <div><Label htmlFor="body">Body</Label><Textarea id="body" name="body" rows={6} defaultValue={editing?.body ?? ""} /></div>
          <div className="flex justify-end gap-2 border-t border-brand-100 pt-4">
            <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-full px-5 text-sm font-semibold text-muted hover:bg-brand-50">Cancel</button>
            <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-70">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!sending} onClose={() => setSending(null)} title="Send Campaign" description={sending?.subject} size="md">
        {sending && (
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">Choose how to deliver this campaign</p>
              <ChannelPicker value={channels} onChange={setChannels} emailConfigured={emailConfigured} smsConfigured={smsConfigured} />
            </div>
            <div className="rounded-2xl bg-brand-50/60 p-4 text-sm text-muted">
              {channels.includes("email") && <p>Email to <strong>{subscribers.filter((s) => s.status === "subscribed").length}</strong> subscribers.</p>}
              {channels.includes("sms") && <p>SMS to <strong>{withPhone}</strong> subscribers with a phone number.</p>}
              {channels.length === 0 && <p>No channels selected. Nothing will be sent.</p>}
            </div>
            <div className="flex justify-end gap-2 border-t border-brand-100 pt-4">
              <button type="button" onClick={() => setSending(null)} className="h-11 rounded-full px-5 text-sm font-semibold text-muted hover:bg-brand-50">Cancel</button>
              <button onClick={doSend} disabled={pending || channels.length === 0} className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send now
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
