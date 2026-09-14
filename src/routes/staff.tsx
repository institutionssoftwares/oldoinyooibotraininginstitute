import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { staffQuery } from "@/lib/queries";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Our Team | OOTI Loitokitok" },
      {
        name: "description",
        content:
          "Meet the management and training team at Oldoinyo Oibor Training Institute, Loitokitok.",
      },
      { property: "og:title", content: "The OOTI Team" },
      { property: "og:description", content: "Management and trainers at OOTI Loitokitok." },
    ],
  }),
  component: Staff,
});

function Staff() {
  const staff = useQuery(staffQuery);
  const list = staff.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Our team"
        title="Management & trainers"
        description="The people who lead training and support trainees at OOTI."
      />
      <section className="section-y">
        <div className="container-page">
          {staff.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              Team profiles will appear here once the institute publishes them.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((person) => (
                <article
                  key={person.id}
                  className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
                >
                  {person.photo_url ? (
                    <img
                      src={person.photo_url}
                      alt={person.full_name}
                      className="h-56 w-full bg-navy/5 object-contain"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="p-6">
                    <h2 className="font-display text-lg font-semibold">{person.full_name}</h2>
                    {person.position ? (
                      <p className="text-sm text-gold">{person.position}</p>
                    ) : null}
                    {person.bio ? (
                      <p className="mt-3 text-sm text-muted-foreground">{person.bio}</p>
                    ) : null}
                    {person.email ? (
                      <a
                        href={`mailto:${person.email}`}
                        className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Mail className="size-4" aria-hidden="true" />
                        {person.email}
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
