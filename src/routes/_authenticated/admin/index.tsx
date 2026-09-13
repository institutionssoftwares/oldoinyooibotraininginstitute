import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, FileText, Images, Megaphone, Newspaper, Users } from "lucide-react";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

const CARDS = [
  { table: "news_posts", label: "News articles", icon: Newspaper, resource: "news" },
  { table: "events", label: "Events", icon: CalendarDays, resource: "events" },
  { table: "announcements", label: "Announcements", icon: Megaphone, resource: "announcements" },
  { table: "gallery_albums", label: "Gallery albums", icon: Images, resource: "albums" },
  { table: "courses", label: "Courses", icon: FileText, resource: "courses" },
  { table: "staff_profiles", label: "Staff profiles", icon: Users, resource: "staff" },
] as const;

function AdminDashboard() {
  const counts = useQuery({
    queryKey: ["admin", "dashboard-counts"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const entries = await Promise.all(
        CARDS.map(async (c) => {
          const { count } = await db.from(c.table).select("id", { count: "exact", head: true });
          return [c.table, count ?? 0] as const;
        }),
      );
      const { count: pending } = await db
        .from("applications")
        .select("id", { count: "exact", head: true })
        .in("status", ["submitted", "under_review"]);
      return { counts: Object.fromEntries(entries) as Record<string, number>, pending: pending ?? 0 };
    },
  });

  const recent = useQuery({
    queryKey: ["admin", "recent-activity"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) return [];
      return (data ?? []) as { id: string; summary: string | null; action: string; user_email: string | null; created_at: string }[];
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the entire public website from here — no code changes needed.
        </p>
      </div>

      {counts.data && counts.data.pending > 0 ? (
        <Link
          to="/staff"
          className="flex items-center justify-between rounded-xl border border-gold/40 bg-gold/10 px-5 py-4 text-sm font-medium text-foreground transition-colors hover:bg-gold/20"
        >
          <span>
            {counts.data.pending} application{counts.data.pending === 1 ? "" : "s"} waiting for review
          </span>
          <span className="flex items-center gap-1 text-primary">
            Review now <ArrowRight className="size-4" />
          </span>
        </Link>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => (
          <Link
            key={c.table}
            to="/admin/$resource"
            params={{ resource: c.resource }}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-lift"
          >
            <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <c.icon className="size-5" />
            </span>
            <span>
              <span className="block text-2xl font-bold">{counts.data?.counts[c.table] ?? "…"}</span>
              <span className="text-sm text-muted-foreground group-hover:text-foreground">{c.label}</span>
            </span>
          </Link>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-card">
        <h2 className="border-b px-5 py-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recent activity
        </h2>
        {recent.data?.length ? (
          <ul className="divide-y">
            {recent.data.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                <StatusBadge status={a.action} />
                <span className="min-w-0 flex-1 truncate">{a.summary ?? a.action}</span>
                <span className="text-xs text-muted-foreground">
                  {a.user_email ?? "system"} · {new Date(a.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">Activity will appear here as you publish content.</p>
        )}
      </section>
    </div>
  );
}
