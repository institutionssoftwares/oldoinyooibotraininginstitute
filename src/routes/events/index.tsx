import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { eventsQuery } from "@/lib/queries";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Events | OOTI Loitokitok" },
      {
        name: "description",
        content:
          "Open days, graduations, industry visits and other events at Oldoinyo Oibor Training Institute, Loitokitok.",
      },
      { property: "og:title", content: "Events at OOTI Loitokitok" },
      { property: "og:description", content: "Upcoming events at the institute." },
    ],
  }),
  component: Events,
});

function Events() {
  const events = useQuery(eventsQuery);
  const list = events.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="What's happening at OOTI"
        description="Open days, graduations, industry visits and community activities."
      />
      <section className="section-y">
        <div className="container-page">
          {events.isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              No events are scheduled yet. Check back soon or follow our news page.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {list.map((event) => (
                <Link
                  key={event.id}
                  to="/events/$slug"
                  params={{ slug: event.slug }}
                  className="group rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-lift"
                >
                  <h2 className="font-display text-lg font-semibold group-hover:text-primary">
                    {event.title}
                  </h2>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {event.starts_at ? (
                      <p className="flex items-center gap-2">
                        <CalendarDays className="size-4" aria-hidden="true" />
                        {new Date(event.starts_at).toLocaleString("en-KE", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    ) : null}
                    {event.location ? (
                      <p className="flex items-center gap-2">
                        <MapPin className="size-4" aria-hidden="true" />
                        {event.location}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
