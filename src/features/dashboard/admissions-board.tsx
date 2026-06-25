"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/dashboard/modal";
import { Label, Select, Textarea } from "@/components/ui/field";
import { SearchInput } from "@/components/ui/search-input";
import { TableWrap, Th, Td, Pill, EmptyState } from "@/components/dashboard/ui";
import { saveRecord, deleteRecord } from "./crud-actions";
import { ADMISSION_STAGES, ADMISSION_STAGE_LABEL, ADMISSION_STAGE_TONE } from "./labels";
import { formatDate } from "@/lib/utils";

interface App {
  id: string; reference: string; child_first_name: string; child_last_name: string;
  gender: string | null; date_of_birth: string | null; applying_for: string | null;
  parent_name: string; parent_phone: string; parent_email: string | null;
  previous_school: string | null; message: string | null; stage: string;
  notes: string | null; created_at: string;
}

const LIST = "/dashboard/admissions";

export function AdmissionsBoard({ apps }: { apps: App[] }) {
  const router = useRouter();
  const [active, setActive] = useState<App | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const q = query.trim().toLowerCase();
  const filtered = apps.filter((a) => {
    if (filter !== "all" && a.stage !== filter) return false;
    if (q) {
      const hay = `${a.reference} ${a.child_first_name} ${a.child_last_name} ${a.parent_name} ${a.parent_phone} ${a.applying_for ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    startTransition(async () => {
      const res = await saveRecord("admission_applications", active!.id, {
        stage: fd.get("stage"),
        notes: fd.get("notes"),
      }, LIST);
      if (res.ok) {
        toast.success("Application updated");
        setActive(null);
        router.refresh();
      } else toast.error(res.message ?? "Could not update");
    });
  }

  function onDelete(app: App) {
    if (!confirm("Delete this application permanently?")) return;
    startTransition(async () => {
      const res = await deleteRecord("admission_applications", app.id, LIST);
      if (res.ok) { toast.success("Deleted"); setActive(null); router.refresh(); }
      else toast.error(res.message ?? "Could not delete");
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {["all", ...ADMISSION_STAGES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold capitalize transition ${filter === s ? "bg-brand-600 text-white" : "bg-white text-muted ring-1 ring-brand-100 hover:bg-brand-50"}`}
            >
              {s === "all" ? "All" : ADMISSION_STAGE_LABEL[s]}
              <span className="ml-1.5 opacity-70">{s === "all" ? apps.length : apps.filter((a) => a.stage === s).length}</span>
            </button>
          ))}
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="Search applications..." className="lg:max-w-xs" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No applications" description="Admission applications submitted from the website appear here." icon={<Eye className="h-6 w-6" />} />
      ) : (
        <TableWrap>
          <thead className="border-b border-brand-100 bg-brand-50/40">
            <tr><Th>Reference</Th><Th>Child</Th><Th>Applying For</Th><Th>Parent</Th><Th>Stage</Th><Th>Date</Th><Th className="text-right">Actions</Th></tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {filtered.map((a) => (
              <tr key={a.id} className="transition hover:bg-brand-50/30">
                <Td className="font-mono text-xs">{a.reference}</Td>
                <Td className="font-semibold text-ink">{a.child_first_name} {a.child_last_name}</Td>
                <Td>{a.applying_for || "Not set"}</Td>
                <Td>
                  <p className="text-ink">{a.parent_name}</p>
                  <p className="text-xs text-muted">{a.parent_phone}</p>
                </Td>
                <Td><Pill tone={ADMISSION_STAGE_TONE[a.stage] ?? "gray"}>{ADMISSION_STAGE_LABEL[a.stage]}</Pill></Td>
                <Td className="text-muted">{formatDate(a.created_at)}</Td>
                <Td className="text-right">
                  <button onClick={() => setActive(a)} className="rounded-lg p-2 text-brand-600 hover:bg-brand-50" aria-label="View"><Eye className="h-4 w-4" /></button>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <Modal open={!!active} onClose={() => setActive(null)} title="Admission Application" description={active?.reference} size="lg">
        {active && (
          <form onSubmit={onSave} className="space-y-4">
            <div className="grid gap-3 rounded-2xl bg-brand-50/50 p-4 sm:grid-cols-2">
              <Detail label="Child" value={`${active.child_first_name} ${active.child_last_name}`} />
              <Detail label="Gender" value={active.gender ?? "Not set"} />
              <Detail label="Date of Birth" value={active.date_of_birth ? formatDate(active.date_of_birth) : "Not set"} />
              <Detail label="Applying For" value={active.applying_for ?? "Not set"} />
              <Detail label="Parent / Guardian" value={active.parent_name} />
              <Detail label="Phone" value={active.parent_phone} />
              <Detail label="Email" value={active.parent_email ?? "Not set"} />
              <Detail label="Previous School" value={active.previous_school ?? "Not set"} />
              {active.message && <div className="sm:col-span-2"><Detail label="Message" value={active.message} /></div>}
            </div>
            <div>
              <Label htmlFor="stage">Stage</Label>
              <Select id="stage" name="stage" defaultValue={active.stage}>
                {ADMISSION_STAGES.map((s) => <option key={s} value={s}>{ADMISSION_STAGE_LABEL[s]}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea id="notes" name="notes" defaultValue={active.notes ?? ""} placeholder="Add notes about this application..." />
            </div>
            <div className="flex justify-between gap-2 border-t border-brand-100 pt-4">
              <button type="button" onClick={() => onDelete(active)} className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
              <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-70">
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
