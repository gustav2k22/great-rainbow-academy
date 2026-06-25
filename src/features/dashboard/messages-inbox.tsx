"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Trash2, Archive, MailOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/dashboard/modal";
import { SearchInput } from "@/components/ui/search-input";
import { TableWrap, Th, Td, Pill, EmptyState } from "@/components/dashboard/ui";
import { setMessageStatus, deleteMessage } from "./comms-actions";
import { formatDateTime } from "@/lib/utils";

interface Msg {
  id: string; name: string; email: string; phone: string | null;
  subject: string | null; message: string; status: string; created_at: string;
}

export function MessagesInbox({ messages, canDelete }: { messages: Msg[]; canDelete: boolean }) {
  const router = useRouter();
  const [active, setActive] = useState<Msg | null>(null);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const q = query.trim().toLowerCase();
  const visible = q
    ? messages.filter((m) => `${m.name} ${m.email} ${m.subject ?? ""} ${m.message}`.toLowerCase().includes(q))
    : messages;

  function open(m: Msg) {
    setActive(m);
    if (m.status === "new") {
      startTransition(async () => { await setMessageStatus(m.id, "read"); router.refresh(); });
    }
  }
  function status(id: string, s: "read" | "archived") {
    startTransition(async () => {
      const res = await setMessageStatus(id, s);
      if (res.ok) { toast.success(`Marked as ${s}`); setActive(null); router.refresh(); }
      else toast.error(res.message ?? "Error");
    });
  }
  function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    startTransition(async () => {
      const res = await deleteMessage(id);
      if (res.ok) { toast.success("Deleted"); setActive(null); router.refresh(); }
      else toast.error(res.message ?? "Error");
    });
  }

  if (messages.length === 0) {
    return <EmptyState title="No messages" description="Messages from the website contact form appear here." icon={<Mail className="h-6 w-6" />} />;
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <SearchInput value={query} onChange={setQuery} placeholder="Search messages..." className="sm:max-w-xs" />
      </div>
      <TableWrap>
        <thead className="border-b border-brand-100 bg-brand-50/40">
          <tr><Th>From</Th><Th>Subject</Th><Th>Received</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr>
        </thead>
        <tbody className="divide-y divide-brand-50">
          {visible.map((m) => (
            <tr key={m.id} className={`cursor-pointer transition hover:bg-brand-50/30 ${m.status === "new" ? "font-semibold" : ""}`} onClick={() => open(m)}>
              <Td>
                <p className="text-ink">{m.name}</p>
                <p className="text-xs font-normal text-muted">{m.email}</p>
              </Td>
              <Td>{m.subject || "No subject"}</Td>
              <Td className="text-muted">{formatDateTime(m.created_at)}</Td>
              <Td><Pill tone={m.status === "new" ? "green" : m.status === "archived" ? "gray" : "blue"}>{m.status}</Pill></Td>
              <Td className="text-right" >
                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => status(m.id, "archived")} className="rounded-lg p-2 text-muted hover:bg-brand-50" aria-label="Archive"><Archive className="h-4 w-4" /></button>
                  {canDelete && <button onClick={() => remove(m.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.subject || "Message"} description={active ? `From ${active.name}` : ""}>
        {active && (
          <div className="space-y-4">
            <div className="grid gap-3 rounded-2xl bg-brand-50/50 p-4 sm:grid-cols-2 text-sm">
              <p><span className="font-bold text-muted">Email:</span> <a href={`mailto:${active.email}`} className="text-brand-700">{active.email}</a></p>
              <p><span className="font-bold text-muted">Phone:</span> {active.phone || "Not provided"}</p>
              <p className="sm:col-span-2"><span className="font-bold text-muted">Received:</span> {formatDateTime(active.created_at)}</p>
            </div>
            <p className="whitespace-pre-wrap rounded-2xl border border-brand-100 p-4 text-sm leading-relaxed text-ink/90">{active.message}</p>
            <div className="flex flex-wrap justify-end gap-2 border-t border-brand-100 pt-4">
              <a href={`mailto:${active.email}?subject=Re: ${encodeURIComponent(active.subject || "Your enquiry")}`} className="inline-flex h-11 items-center gap-1.5 rounded-full bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700">
                <MailOpen className="h-4 w-4" /> Reply by Email
              </a>
              <button onClick={() => status(active.id, "archived")} disabled={pending} className="inline-flex h-11 items-center gap-1.5 rounded-full border border-brand-200 px-5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />} Archive
              </button>
              {canDelete && (
                <button onClick={() => remove(active.id)} className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
