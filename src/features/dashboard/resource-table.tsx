import { ResourceManager, type FieldDef, type HeaderDef, type ResourceItem } from "./resource-manager";

export type { FieldDef } from "./resource-manager";

export interface ColumnDef<T = any> {
  key: string;
  label: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

/**
 * Server wrapper around the client <ResourceManager />. It pre-renders each
 * cell here (on the server) so no functions cross the server/client boundary.
 */
export function ResourceTable({
  table,
  listPath,
  rows,
  columns,
  fields,
  title,
  addLabel,
  emptyHint,
}: {
  table: string;
  listPath: string;
  rows: Record<string, any>[];
  columns: ColumnDef[];
  fields: FieldDef[];
  title: string;
  addLabel?: string;
  emptyHint?: string;
}) {
  const headers: HeaderDef[] = columns.map((c) => ({ label: c.label, className: c.className }));
  const items: ResourceItem[] = rows.map((r) => ({
    id: r.id,
    record: r,
    cells: columns.map((c) => (c.render ? c.render(r) : (r[c.key] ?? ""))),
    // searchable text from primitive field values (ignores nested objects)
    search: Object.values(r)
      .filter((v) => typeof v === "string" || typeof v === "number")
      .join(" "),
  }));

  return (
    <ResourceManager
      table={table}
      listPath={listPath}
      headers={headers}
      items={items}
      fields={fields}
      title={title}
      addLabel={addLabel}
      emptyHint={emptyHint}
    />
  );
}
