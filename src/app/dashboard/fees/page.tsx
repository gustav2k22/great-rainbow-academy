import { requireAuth, ADMIN_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader, Pill, StatCard } from "@/components/dashboard/ui";
import { Wallet, TrendingUp, CircleAlert } from "lucide-react";
import { ResourceTable, type FieldDef, type ColumnDef } from "@/features/dashboard/resource-table";
import { INVOICE_STATUS_TONE } from "@/features/dashboard/labels";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
const LIST = "/dashboard/fees";

export default async function FeesAdmin() {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  const [{ data: invoicesRaw }, { data: students }] = await Promise.all([
    supabase.from("fee_invoices").select("*, student:student_id(first_name,last_name)").order("created_at", { ascending: false }),
    supabase.from("students").select("id, first_name, last_name").eq("status", "active").order("first_name"),
  ]);

  const invoices = invoicesRaw ?? [];
  const totalBilled = invoices.reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
  const totalPaid = invoices.reduce((s: number, i: any) => s + Number(i.amount_paid || 0), 0);
  const outstanding = totalBilled - totalPaid;

  const rows = invoices.map((i: any) => ({ ...i, student_name: i.student ? `${i.student.first_name} ${i.student.last_name}` : "Unknown" }));
  const studentOptions = (students ?? []).map((s: any) => ({ value: s.id, label: `${s.first_name} ${s.last_name}` }));

  const columns: ColumnDef<any>[] = [
    { key: "student_name", label: "Student", render: (r) => <span className="font-semibold text-ink">{r.student_name}</span> },
    { key: "amount", label: "Amount", render: (r) => formatCurrency(Number(r.amount)) },
    { key: "amount_paid", label: "Paid", render: (r) => formatCurrency(Number(r.amount_paid)) },
    { key: "due_date", label: "Due", render: (r) => formatDate(r.due_date) || "Not set" },
    { key: "status", label: "Status", render: (r) => <Pill tone={INVOICE_STATUS_TONE[r.status] ?? "gray"}>{r.status}</Pill> },
  ];
  const fields: FieldDef[] = [
    { name: "student_id", label: "Student", type: "select", required: true, options: studentOptions },
    { name: "amount", label: "Amount (GHS)", type: "number", required: true },
    { name: "amount_paid", label: "Amount Paid (GHS)", type: "number", defaultValue: 0 },
    { name: "due_date", label: "Due Date", type: "date" },
    { name: "status", label: "Status", type: "select", defaultValue: "unpaid", options: [
      { value: "unpaid", label: "Unpaid" }, { value: "partial", label: "Partial" },
      { value: "paid", label: "Paid" }, { value: "overdue", label: "Overdue" },
    ] },
  ];

  return (
    <div>
      <DashHeader title="Fees" description="Manage student fee invoices and payments." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Billed" value={formatCurrency(totalBilled)} icon={<Wallet className="h-6 w-6" />} accent="#6366f1" />
        <StatCard label="Collected" value={formatCurrency(totalPaid)} icon={<TrendingUp className="h-6 w-6" />} accent="#22c55e" />
        <StatCard label="Outstanding" value={formatCurrency(outstanding)} icon={<CircleAlert className="h-6 w-6" />} accent="#ef4444" />
      </div>
      <ResourceTable table="fee_invoices" listPath={LIST} rows={rows} columns={columns} fields={fields} title="Invoice" addLabel="Add Invoice" />
    </div>
  );
}
