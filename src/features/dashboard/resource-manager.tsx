"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/dashboard/modal";
import { MediaPicker } from "@/components/dashboard/media-picker";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { SearchInput } from "@/components/ui/search-input";
import { TableWrap, Th, Td, EmptyState } from "@/components/dashboard/ui";
import { ICON_NAMES } from "@/components/ui/icon";
import { saveRecord, deleteRecord } from "./crud-actions";

export type FieldType =
  | "text" | "textarea" | "number" | "select" | "checkbox"
  | "color" | "icon" | "media" | "date" | "datetime";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  mediaFolder?: string;
  full?: boolean;
  help?: string;
  defaultValue?: any;
}

export interface HeaderDef {
  label: string;
  className?: string;
}

export interface ResourceItem {
  id: string;
  cells: React.ReactNode[];
  record: Record<string, any>;
  search?: string;
}

export function ResourceManager({
  table,
  listPath,
  headers,
  items,
  fields,
  title,
  addLabel = "Add",
  emptyHint,
  searchable = true,
}: {
  table: string;
  listPath: string;
  headers: HeaderDef[];
  items: ResourceItem[];
  fields: FieldDef[];
  title: string;
  addLabel?: string;
  emptyHint?: string;
  searchable?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const visible =
    searchable && query.trim()
      ? items.filter((it) => (it.search ?? "").toLowerCase().includes(query.trim().toLowerCase()))
      : items;

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(record: Record<string, any>) {
    setEditing(record);
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = formRef.current!;
    const fd = new FormData(form);
    const values: Record<string, any> = {};
    for (const f of fields) {
      const raw = fd.get(f.name);
      if (f.type === "checkbox") values[f.name] = fd.get(f.name) === "on";
      else if (f.type === "number") values[f.name] = raw === "" || raw === null ? null : Number(raw);
      else values[f.name] = raw ?? null;
    }
    startTransition(async () => {
      const res = await saveRecord(table, editing?.id ?? null, values, listPath);
      if (res.ok) {
        toast.success(editing ? "Updated successfully" : "Created successfully");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.message ?? "Something went wrong");
      }
    });
  }

  function onDelete(id: string) {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteRecord(table, id, listPath);
      if (res.ok) {
        toast.success("Deleted");
        router.refresh();
      } else {
        toast.error(res.message ?? "Could not delete");
      }
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {searchable && items.length > 0 ? (
          <SearchInput value={query} onChange={setQuery} placeholder={`Search ${title.toLowerCase()}...`} className="sm:max-w-xs" />
        ) : (
          <span />
        )}
        <button onClick={openCreate} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-700">
          <Plus className="h-4 w-4" /> {addLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState title={`No ${title.toLowerCase()} yet`} description={emptyHint} icon={<Plus className="h-6 w-6" />}>
          <button onClick={openCreate} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700">
            <Plus className="h-4 w-4" /> {addLabel}
          </button>
        </EmptyState>
      ) : (
        <TableWrap>
          <thead className="border-b border-brand-100 bg-brand-50/40">
            <tr>
              {headers.map((h, i) => (
                <Th key={i} className={h.className}>{h.label}</Th>
              ))}
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {visible.map((item) => (
              <tr key={item.id} className="transition hover:bg-brand-50/30">
                {item.cells.map((cell, i) => (
                  <Td key={i} className={headers[i]?.className}>{cell}</Td>
                ))}
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(item.record)} className="rounded-lg p-2 text-brand-600 hover:bg-brand-50" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(item.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </Td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={headers.length + 1} className="px-4 py-10 text-center text-sm text-muted">No results match your search.</td>
              </tr>
            )}
          </tbody>
        </TableWrap>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? `Edit ${title}` : `New ${title}`} size="lg">
        <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <FieldInput key={f.name} field={f} value={editing?.[f.name]} record={editing} />
            ))}
          </div>
          <div className="flex justify-end gap-2 border-t border-brand-100 pt-4">
            <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-full px-5 text-sm font-semibold text-muted hover:bg-brand-50">Cancel</button>
            <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-70">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editing ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function FieldInput({ field, value, record }: { field: FieldDef; value: any; record: any }) {
  const v = value ?? field.defaultValue ?? "";
  const wrap = field.full || ["textarea", "media"].includes(field.type) ? "sm:col-span-2" : "";

  if (field.type === "media") {
    return (
      <div className={wrap}>
        <Label>{field.label}</Label>
        <MediaPicker
          name={field.name}
          defaultValue={value ?? null}
          defaultPreview={record?.[`${field.name}_preview`] ?? null}
          folder={field.mediaFolder ?? "general"}
          label={field.label}
        />
      </div>
    );
  }

  return (
    <div className={wrap}>
      {field.type !== "checkbox" && <Label htmlFor={field.name} required={field.required}>{field.label}</Label>}
      {field.type === "textarea" ? (
        <Textarea id={field.name} name={field.name} required={field.required} placeholder={field.placeholder} defaultValue={v} />
      ) : field.type === "select" ? (
        <Select id={field.name} name={field.name} required={field.required} defaultValue={v ?? ""}>
          <option value="">Select...</option>
          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      ) : field.type === "icon" ? (
        <Select id={field.name} name={field.name} defaultValue={v ?? ""}>
          <option value="">No icon</option>
          {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
        </Select>
      ) : field.type === "checkbox" ? (
        <label className="flex h-11 items-center gap-2.5 rounded-xl border border-brand-200 px-4">
          <input type="checkbox" name={field.name} defaultChecked={value !== undefined && value !== null ? !!value : !!field.defaultValue} className="h-4 w-4 accent-brand-600" />
          <span className="text-sm font-semibold text-ink">{field.label}</span>
        </label>
      ) : field.type === "color" ? (
        <div className="flex items-center gap-2">
          <input type="color" name={field.name} defaultValue={v || "#7c3aed"} className="h-11 w-16 rounded-lg border border-brand-200" />
        </div>
      ) : (
        <Input
          id={field.name}
          name={field.name}
          type={field.type === "datetime" ? "datetime-local" : field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
          required={field.required}
          placeholder={field.placeholder}
          defaultValue={field.type === "datetime" && v ? String(v).slice(0, 16) : v}
        />
      )}
      {field.help && <p className="mt-1 text-xs text-muted">{field.help}</p>}
    </div>
  );
}
