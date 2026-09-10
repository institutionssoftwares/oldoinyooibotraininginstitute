import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ClipboardList, FileSearch, ShieldCheck, UserRound } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { getMyPortalContext } from "@/lib/applications.functions";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({
    meta: [
      { title: "My Portal | OOTI Loitokitok" },
      { name: "description", content: "Your OOTI portal home." },
      { property: "og:title", content: "OOTI Portal" },
      { property: "og:description", content: "Your OOTI portal home." },
    ],
  }),
  component: Portal,
});

function Portal() {
  const { user } = Route.useRouteContext();
  const fetchCtx = useServerFn(getMyPortalContext);
  const ctx = useQuery({ queryKey: ["portal-context", user.id], queryFn: () => fetchCtx() });

  const name = ctx.data?.profile?.full_name ?? user.email ?? "there";

  return (
    <>
      <PageHeader eyebrow="Portal" title={`Welcome, ${name}`} description={user.email ?? ""} />
      <section className="section-y">
        <div className="container-page grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card
            icon={<UserRound className="size-5" />}
            title="Your account"
            body={
              ctx.isLoading
                ? "Loading…"
                : ctx.data?.roles.length
                  ? `Role: ${ctx.data.roles.join(", ")}`
                  : "No portal role has been assigned yet. Contact the office if you are a student or staff member."
            }
          />
          <Card
            icon={<FileSearch className="size-5" />}
            title="Application status"
            body="Check the progress of an admissions application using your reference number."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/application-status">Check status</Link>
              </Button>
            }
          />
          {ctx.data?.isStaff ? (
            <Card
              icon={<ShieldCheck className="size-5" />}
              title="Admissions desk"
              body={
                ctx.data.pendingApplications
                  ? `${ctx.data.pendingApplications} new application${ctx.data.pendingApplications === 1 ? "" : "s"} awaiting review.`
                  : "No new applications awaiting review."
              }
              action={
                <Button asChild variant="gold" size="sm">
                  <Link to="/staff">
                    <ClipboardList className="size-4" /> Open admissions
                  </Link>
                </Button>
              }
            />
          ) : null}
        </div>
      </section>
    </>
  );
}

function Card({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h2 className="mt-4 font-display text-lg font-bold">{title}</h2>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
