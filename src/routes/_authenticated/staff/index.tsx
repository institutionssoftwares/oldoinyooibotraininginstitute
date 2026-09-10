import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listApplications, updateApplicationStatus } from "@/lib/applications.functions";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationStatus,
} from "@/lib/applications.schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/staff/")({
  head: () => ({
    meta: [
      { title: "Admissions Desk | OOTI Staff" },
      { name: "description", content: "Review and update OOTI admissions applications." },
      { property: "og:title", content: "OOTI Admissions Desk" },
      { property: "og:description", content: "Staff-only admissions review." },
    ],
  }),
  component: StaffApplications,
});

function StaffApplications() {
  const qc = useQueryClient();
  const list = useServerFn(listApplications);
  const update = useServerFn(updateApplicationStatus);
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");
  const [search, setSearch] = useState("");

  const apps = useQuery({
    queryKey: ["staff-applications", status, search],
    queryFn: () =>
      list({ data: { status: status === "all" ? undefined : status, search: search || undefined } }),
  });

  const mutation = useMutation({
    mutationFn: (vars: { id: string; status: ApplicationStatus }) => update({ data: vars }),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["staff-applications"] });
      qc.invalidateQueries({ queryKey: ["portal-context"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not update status"),
  });

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      <PageHeader
        eyebrow="Staff"
        title="Admissions desk"
        description="Review applications and update their status. Applicants see changes immediately when they check their status."
      />
      <section className="section-y">
        <div className="container-page space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
              {(["all", ...APPLICATION_STATUSES] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={status === s}
                  onClick={() => setStatus(s)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    status === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s === "all" ? "All" : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <div className="relative ml-auto w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search applications"
                placeholder="Search name, reference or phone"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Loading applications…
                    </TableCell>
                  </TableRow>
                ) : apps.isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-destructive">
                      {(apps.error as Error).message}
                    </TableCell>
                  </TableRow>
                ) : !apps.data?.length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No applications match this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  apps.data.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{a.reference}</TableCell>
                      <TableCell>
                        <div className="font-medium">{a.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {a.phone}
                          {a.email ? ` · ${a.email}` : ""}
                          {a.county ? ` · ${a.county}` : ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{a.course_name ?? "—"}</div>
                        {a.intake ? (
                          <div className="text-xs text-muted-foreground">{a.intake}</div>
                        ) : null}
                      </TableCell>
                      <TableCell>{a.mean_grade ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{fmt(a.created_at)}</TableCell>
                      <TableCell>
                        <select
                          aria-label={`Status for ${a.full_name}`}
                          value={a.status}
                          disabled={mutation.isPending}
                          onChange={(e) =>
                            mutation.mutate({ id: a.id, status: e.target.value as ApplicationStatus })
                          }
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        >
                          {APPLICATION_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </>
  );
}
