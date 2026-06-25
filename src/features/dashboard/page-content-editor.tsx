"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/dashboard/modal";
import { MediaPicker } from "@/components/dashboard/media-picker";
import { Input, Label, Textarea } from "@/components/ui/field";
import { Panel, Pill } from "@/components/dashboard/ui";
import { saveRecord } from "./crud-actions";

interface Section {
  id: string;
  page_slug: string;
  section_key: string;
  heading: string | null;
  subheading: string | null;
  body: string | null;
  media_id: string | null;
  media_preview?: string | null;
  data: Record<string, any>;
  is_published: boolean;
}

const PAGE_LABEL: Record<string, string> = {
  home: "Home Page",
  about: "About Page",
  admissions: "Admissions Page",
};

export function PageContentEditor({ sections }: { sections: Section[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Section | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const grouped = sections.reduce<Record<string, Section[]>>((acc, s) => {
    (acc[s.page_slug] ??= []).push(s);
    return acc;
  }, {});

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(formRef.current!);
    let data: any = editing?.data ?? {};
    const rawData = fd.get("data") as string;
    if (rawData?.trim()) {
      try {
        data = JSON.parse(rawData);
      } catch {
        toast.error("The advanced data is not valid JSON.");
        return;
      }
    }
    const values = {
      heading: fd.get("heading"),
      subheading: fd.get("subheading"),
      body: fd.get("body"),
      media_id: fd.get("media_id") || null,
      data,
      is_published: fd.get("is_published") === "on",
    };
    startTransition(async () => {
      const res = await saveRecord("page_sections", editing!.id, values, "/dashboard/content");
      if (res.ok) {
        toast.success("Section updated. The website will reflect changes shortly.");
        setEditing(null);
        router.refresh();
      } else toast.error(res.message ?? "Could not save");
    });
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([page, items]) => (
        <div key={page}>
          <h2 className="mb-3 font-display text-lg font-bold text-ink">{PAGE_LABEL[page] ?? page}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((s) => (
              <Panel key={s.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-brand-500">{s.section_key}</p>
                    <p className="mt-1 font-semibold text-ink">{s.heading || "Untitled"}</p>
                  </div>
                  <Pill tone={s.is_published ? "green" : "gray"}>{s.is_published ? "Live" : "Hidden"}</Pill>
                </div>
                {s.subheading && <p className="mt-1 text-sm font-medium text-brand-600">{s.subheading}</p>}
                {s.body && <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">{s.body}</p>}
                <button onClick={() => setEditing(s)} className="mt-4 inline-flex h-9 w-fit items-center gap-1.5 rounded-lg border border-brand-200 px-3 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                  <Pencil className="h-4 w-4" /> Edit
                </button>
              </Panel>
            ))}
          </div>
        </div>
      ))}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit: ${editing?.section_key ?? ""}`} description="Update the content shown on the public website." size="lg">
        {editing && (
          <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="heading">Heading</Label>
              <Input id="heading" name="heading" defaultValue={editing.heading ?? ""} />
            </div>
            <div>
              <Label htmlFor="subheading">Subheading</Label>
              <Input id="subheading" name="subheading" defaultValue={editing.subheading ?? ""} />
            </div>
            <div>
              <Label htmlFor="body">Body</Label>
              <Textarea id="body" name="body" rows={5} defaultValue={editing.body ?? ""} />
            </div>
            <div>
              <Label>Image / Media</Label>
              <MediaPicker name="media_id" defaultValue={editing.media_id} defaultPreview={editing.media_preview ?? null} folder="content" />
            </div>
            <div>
              <Label htmlFor="data">Advanced data (JSON)</Label>
              <Textarea id="data" name="data" rows={5} className="font-mono text-xs" defaultValue={JSON.stringify(editing.data ?? {}, null, 2)} />
              <p className="mt-1 text-xs text-muted">Controls things like call-to-action buttons, lists and steps. Edit carefully.</p>
            </div>
            <label className="flex items-center gap-2.5">
              <input type="checkbox" name="is_published" defaultChecked={editing.is_published} className="h-4 w-4 accent-brand-600" />
              <span className="text-sm font-semibold text-ink">Published (visible on the website)</span>
            </label>
            <div className="flex justify-end gap-2 border-t border-brand-100 pt-4">
              <button type="button" onClick={() => setEditing(null)} className="h-11 rounded-full px-5 text-sm font-semibold text-muted hover:bg-brand-50">Cancel</button>
              <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-70">
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
