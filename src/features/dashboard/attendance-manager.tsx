"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Select } from "@/components/ui/field";
import { Panel, EmptyState } from "@/components/dashboard/ui";
import { initials } from "@/lib/utils";
import { saveAttendance } from "./attendance-actions";

interface Student { id: string; first_name: string; last_name: string; student_no: string }
const STATUSES = [
  { value: "present", label: "Present", tone: "bg-rainbow-green text-white" },
  { value: "absent", label: "Absent", tone: "bg-rainbow-red text-white" },
  { value: "late", label: "Late", tone: "bg-rainbow-orange text-white" },
  { value: "excused", label: "Excused", tone: "bg-rainbow-blue text-white" },
];

export function AttendanceManager({
  classes,
  classId,
  date,
  students,
  initial,
}: {
  classes: { id: string; name: string }[];
  classId: string;
  date: string;
  students: Student[];
  initial: Record<string, string>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [marks, setMarks] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    students.forEach((s) => (m[s.id] = initial[s.id] ?? "present"));
    return m;
  });

  function navigate(nextClass: string, nextDate: string) {
    router.push(`/dashboard/attendance?class_id=${nextClass}&date=${nextDate}`);
  }
  function markAll(status: string) {
    const m: Record<string, string> = {};
    students.forEach((s) => (m[s.id] = status));
    setMarks(m);
  }
  function save() {
    startTransition(async () => {
      const records = students.map((s) => ({ student_id: s.id, status: marks[s.id] ?? "present" }));
      const res = await saveAttendance(classId, date, records);
      if (res.ok) { toast.success("Attendance saved"); router.refresh(); }
      else toast.error(res.message ?? "Error");
    });
  }

  return (
    <div className="space-y-5">
      <Panel>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Class</label>
            <Select value={classId} onChange={(e) => navigate(e.target.value, date)}>
              <option value="">Select a class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Date</label>
            <input type="date" value={date} onChange={(e) => navigate(classId, e.target.value)} className="h-11 w-full rounded-xl border border-brand-200 px-4 text-sm outline-none focus:border-brand-400" />
          </div>
        </div>
      </Panel>

      {!classId ? (
        <EmptyState title="Select a class" description="Choose a class and date to take attendance." icon={<CheckCheck className="h-6 w-6" />} />
      ) : students.length === 0 ? (
        <EmptyState title="No students in this class" description="Add students and assign them to this class first." icon={<CheckCheck className="h-6 w-6" />} />
      ) : (
        <Panel>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">{students.length} students</p>
            <div className="flex gap-1.5">
              <button onClick={() => markAll("present")} className="rounded-full bg-rainbow-green/15 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-rainbow-green/25">All Present</button>
              <button onClick={() => markAll("absent")} className="rounded-full bg-rainbow-red/15 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-rainbow-red/25">All Absent</button>
            </div>
          </div>
          <div className="space-y-2">
            {students.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 p-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">{initials(`${s.first_name} ${s.last_name}`)}</span>
                  <div>
                    <p className="font-semibold text-ink">{s.first_name} {s.last_name}</p>
                    <p className="text-xs text-muted">{s.student_no}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((st) => (
                    <button
                      key={st.value}
                      onClick={() => setMarks((m) => ({ ...m, [s.id]: st.value }))}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${marks[s.id] === st.value ? st.tone : "bg-brand-50 text-muted hover:bg-brand-100"}`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={save} disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-70">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Attendance
            </button>
          </div>
        </Panel>
      )}
    </div>
  );
}
