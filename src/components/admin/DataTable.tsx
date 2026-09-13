import { useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { bulkUpdate, deleteRows, listRows, type Row } from "@/lib/admin/api";
import { STATUS_META, type ResourceDef } from "@/lib/admin/resources";

function Cell({ row, col }: { row: Row; col: NonNullable<ResourceDef["columns"]>[number] }) {
  const v = row[col.key];
  if (col.type === "status") return <StatusBadge status={v as string} />;
  if (col.type === "boolean") return <span>{v ? "Yes" : "No"}</span>;
  if (col.type === "date" || col.type === "datetime") {
    if (!v) return <span className="text-muted-foreground">—</span>;
    const d = new Date(v as string);
    return <span>{col.type === "date" ? d.toLocaleDateString() : d.toLocaleString()}</span>;
  }
  if (col.type === "number") return <span>{(v as number) ?? "—"}</span>;
  if (col.render) return <>{col.render(row)}</>;
  const text = (v as string) ?? "";
  return <span className="line-clamp-1">{text || <span className="text-muted-foreground">—</span>}</span>;
}

export function DataTable({ def }: { def: ResourceDef }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const query = useQuery({
    queryKey: ["admin", def.table, { search, status, filters, page }],
    queryFn: () => listRows(def, { search, status: status || undefined, filters, page }),
    placeholderData: keepPreviousData,
  });
  const rows = query.data?.rows ?? [];
  const count = query.data?.count ?? 0;
  const pageSize = 25;
  const pages = Math.max(1, Math.ceil(count / pageSize));

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", def.table] });

  const bulkDelete = useMutation({
    mutationFn: (ids: string[]) => deleteRows(def.table, ids),
    onSuccess: () => {
      toast.success("Deleted");
      setSelected(new Set());
      void invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const bulkStatus = useMutation({
    mutationFn: ({ ids, value }: { ids: string[]; value: string }) => bulkUpdate(def.table, ids, { status: value }),
    onSuccess: () => {
      toast.success("Status updated");
      setSelected(new Set());
      void invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const titleOf = (r: Row) => (r[def.titleField] as string) ?? "Untitled";
  const cols = useMemo(() => def.columns, [def]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder={`Search ${def.plural.toLowerCase()}…`}
            className="pl-9"
          />
        </div>
        {def.statusable ? (
          <Select
            value={status || "all"}
            onValueChange={(v) => {
              setStatus(v === "all" ? "" : v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.keys(STATUS_META).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_META[s as keyof typeof STATUS_META].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        {(def.filters ?? []).map((f) => (
          <Select
            key={f.column}
            value={filters[f.column] || "all"}
            onValueChange={(v) => {
              setFilters((s) => ({ ...s, [f.column]: v === "all" ? "" : v }));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{f.label}: all</SelectItem>
              {f.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        <Button asChild variant="navy">
          <Link to="/admin/$resource/new" params={{ resource: def.key }}>
            <Plus className="size-4" /> New {def.singular.toLowerCase()}
          </Link>
        </Button>
      </div>

      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm">
          <span className="font-medium">{selected.size} selected</span>
          {def.statusable ? (
            <>
              <Button size="sm" variant="outline" onClick={() => bulkStatus.mutate({ ids: [...selected], value: "published" })}>
                Publish
              </Button>
              <Button size="sm" variant="outline" onClick={() => bulkStatus.mutate({ ids: [...selected], value: "draft" })}>
                Move to draft
              </Button>
              <Button size="sm" variant="outline" onClick={() => bulkStatus.mutate({ ids: [...selected], value: "archived" })}>
                Archive
              </Button>
            </>
          ) : null}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              if (window.confirm(`Delete ${selected.size} item(s)? This cannot be undone.`)) bulkDelete.mutate([...selected]);
            }}
          >
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="w-10 px-3 py-2.5">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
              </th>
              {cols.map((c) => (
                <th key={c.key} className="px-3 py-2.5 font-medium text-muted-foreground">
                  {c.label}
                </th>
              ))}
              <th className="w-12 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {query.isLoading ? (
              <tr>
                <td colSpan={cols.length + 2} className="px-4 py-12 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={cols.length + 2} className="px-4 py-12 text-center text-muted-foreground">
                  No {def.plural.toLowerCase()} found.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2.5">
                    <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggle(r.id)} aria-label={`Select ${titleOf(r)}`} />
                  </td>
                  {cols.map((c, i) => (
                    <td key={c.key} className="max-w-56 px-3 py-2.5">
                      {i === 0 ? (
                        <Link
                          to="/admin/$resource/$id"
                          params={{ resource: def.key, id: r.id }}
                          className="font-medium text-foreground hover:text-primary hover:underline"
                        >
                          <Cell row={r} col={c} />
                        </Link>
                      ) : (
                        <Cell row={r} col={c} />
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2.5">
                    <Button asChild size="icon" variant="ghost" aria-label="Edit">
                      <Link to="/admin/$resource/$id" params={{ resource: def.key, id: r.id }}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {count} total · page {page + 1} of {pages}
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="size-4" /> Previous
          </Button>
          <Button size="sm" variant="outline" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>
            Next <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
