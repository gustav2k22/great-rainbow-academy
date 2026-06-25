"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, KeyRound, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/dashboard/modal";
import { Input, Label, Select } from "@/components/ui/field";
import { SearchInput } from "@/components/ui/search-input";
import { TableWrap, Th, Td, Pill } from "@/components/dashboard/ui";
import { ROLE_LABELS } from "@/lib/constants";
import { createStaffUser, updateUser, resetUserPassword, deleteStaffUser } from "./users-actions";
import { initials, formatDate } from "@/lib/utils";
import type { Profile, UserRole } from "@/lib/types";

const ROLE_OPTS: { value: UserRole; label: string }[] = [
  { value: "system_administrator", label: "System Administrator" },
  { value: "school_administrator", label: "School Administrator" },
  { value: "teacher", label: "Teacher" },
  { value: "staff", label: "Staff" },
];
const TONE: Record<string, "violet" | "blue" | "green" | "orange" | "gray"> = {
  system_administrator: "violet", school_administrator: "blue", teacher: "green", staff: "orange",
};

export function UsersManager({ users, meId }: { users: Profile[]; meId: string }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [resetting, setResetting] = useState<Profile | null>(null);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const q = query.trim().toLowerCase();
  const visible = q
    ? users.filter((u) => `${u.full_name} ${u.email ?? ""} ${ROLE_LABELS[u.role]}`.toLowerCase().includes(q))
    : users;

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    startTransition(async () => {
      const res = await createStaffUser(fd);
      if (res.ok) { toast.success("User created"); setCreateOpen(false); router.refresh(); }
      else toast.error(res.message ?? "Error");
    });
  }
  function onEdit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    startTransition(async () => {
      const res = await updateUser(editing!.id, {
        full_name: fd.get("full_name") as string,
        role: fd.get("role") as UserRole,
        phone: fd.get("phone") as string,
        status: fd.get("status") as string,
      });
      if (res.ok) { toast.success("User updated"); setEditing(null); router.refresh(); }
      else toast.error(res.message ?? "Error");
    });
  }
  function onReset(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    startTransition(async () => {
      const res = await resetUserPassword(resetting!.id, fd.get("password") as string);
      if (res.ok) { toast.success("Password reset"); setResetting(null); }
      else toast.error(res.message ?? "Error");
    });
  }
  function del(u: Profile) {
    if (!confirm(`Delete ${u.full_name}? This removes their login permanently.`)) return;
    startTransition(async () => {
      const res = await deleteStaffUser(u.id);
      if (res.ok) { toast.success("User deleted"); router.refresh(); }
      else toast.error(res.message ?? "Error");
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query} onChange={setQuery} placeholder="Search users..." className="sm:max-w-xs" />
        <button onClick={() => setCreateOpen(true)} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700"><Plus className="h-4 w-4" /> Add User</button>
      </div>

      <TableWrap>
        <thead className="border-b border-brand-100 bg-brand-50/40"><tr><Th>User</Th><Th>Role</Th><Th>Status</Th><Th>Joined</Th><Th className="text-right">Actions</Th></tr></thead>
        <tbody className="divide-y divide-brand-50">
          {visible.map((u) => (
            <tr key={u.id} className="transition hover:bg-brand-50/30">
              <Td>
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">{initials(u.full_name)}</span>
                  <div>
                    <p className="font-semibold text-ink">{u.full_name} {u.id === meId && <span className="text-xs text-muted">(you)</span>}</p>
                    <p className="text-xs text-muted">{u.email}</p>
                  </div>
                </div>
              </Td>
              <Td><Pill tone={TONE[u.role] ?? "gray"}>{ROLE_LABELS[u.role]}</Pill></Td>
              <Td><Pill tone={u.status === "active" ? "green" : "red"}>{u.status}</Pill></Td>
              <Td className="text-muted">{formatDate(u.created_at)}</Td>
              <Td className="text-right">
                <div className="flex justify-end gap-1">
                  <button onClick={() => setEditing(u)} className="rounded-lg p-2 text-brand-600 hover:bg-brand-50" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setResetting(u)} className="rounded-lg p-2 text-brand-600 hover:bg-brand-50" aria-label="Reset password"><KeyRound className="h-4 w-4" /></button>
                  {u.id !== meId && <button onClick={() => del(u)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      {/* Create */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Staff User">
        <form onSubmit={onCreate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="full_name" required>Full Name</Label><Input id="full_name" name="full_name" required /></div>
            <div><Label htmlFor="email" required>Email</Label><Input id="email" name="email" type="email" required /></div>
            <div><Label htmlFor="password" required>Temp Password</Label><Input id="password" name="password" type="text" required minLength={8} /></div>
            <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" /></div>
          </div>
          <div><Label htmlFor="role" required>Role</Label><Select id="role" name="role" required defaultValue="teacher">{ROLE_OPTS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</Select></div>
          <SubmitRow pending={pending} onCancel={() => setCreateOpen(false)} label="Create User" />
        </form>
      </Modal>

      {/* Edit */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit User">
        {editing && (
          <form onSubmit={onEdit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="full_name">Full Name</Label><Input id="full_name" name="full_name" defaultValue={editing.full_name} /></div>
              <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" defaultValue={editing.phone ?? ""} /></div>
              <div><Label htmlFor="role">Role</Label><Select id="role" name="role" defaultValue={editing.role}>{ROLE_OPTS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</Select></div>
              <div><Label htmlFor="status">Status</Label><Select id="status" name="status" defaultValue={editing.status}><option value="active">Active</option><option value="suspended">Suspended</option></Select></div>
            </div>
            <SubmitRow pending={pending} onCancel={() => setEditing(null)} label="Save changes" />
          </form>
        )}
      </Modal>

      {/* Reset password */}
      <Modal open={!!resetting} onClose={() => setResetting(null)} title="Reset Password" description={resetting?.email ?? undefined}>
        {resetting && (
          <form onSubmit={onReset} className="space-y-4">
            <div><Label htmlFor="password" required>New Password</Label><Input id="password" name="password" type="text" required minLength={8} placeholder="At least 8 characters" /></div>
            <SubmitRow pending={pending} onCancel={() => setResetting(null)} label="Reset Password" />
          </form>
        )}
      </Modal>
    </div>
  );
}

function SubmitRow({ pending, onCancel, label }: { pending: boolean; onCancel: () => void; label: string }) {
  return (
    <div className="flex justify-end gap-2 border-t border-brand-100 pt-4">
      <button type="button" onClick={onCancel} className="h-11 rounded-full px-5 text-sm font-semibold text-muted hover:bg-brand-50">Cancel</button>
      <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-70">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {label}
      </button>
    </div>
  );
}
