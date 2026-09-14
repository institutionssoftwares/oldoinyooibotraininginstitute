import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { eventQuery } from "@/lib/queries";

export const Route = createFileRoute("/events/$slug")({
  head: ({ params }) => {
    const readable = params.slug.replace(/-/g, " ");
    return {
      meta: [
        { title: `${readable} | OOTI Events` },
        {
          name: "description",
          content: `${readable} at Oldoinyo Oibor Training Institute, Loitokitok. Date, venue and details.`,
        },
        { property: "og:title", content: `${readable} | OOTI Events` },
        { property: "og:description", content: "Event details at OOTI Loitokitok." },
      ],
    };
  },
  component: EventDetail,
});

function EventDetail() {
  const { slug } = Route.useParams();
  const event = useQuery(eventQuery(slug));

  if (event.isLoading) {
    return <div className="container-page section-y text-muted-foreground">Loading…</div>;
  }

  if (!event.data) {
    return (
      <div className="container-page section-y">
        <h1 className="font-display text-2xl font-bold">Event not found</h1>
        <Button asChild className="mt-6">
          <Link to="/events">Back to events</Link>
        </Button>
      </div>
    );
  }

  const e = event.data;
  const when = e.starts_at
    ? new Date(e.starts_at).toLocaleString("en-KE", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <>
      <PageHeader
        eyebrow="Event"
        title={e.title}
        description={[when, e.location].filter(Boolean).join(" · ") || undefined}
      />
      <section className="section-y">
        <div className="container-page max-w-3xl">
          {e.image_url ? (
            <img
              src={e.image_url}
              alt=""
              className="mb-8 max-h-[36rem] w-full rounded-xl bg-navy/5 object-contain shadow-card"
              loading="lazy"
            />
          ) : null}
          {e.description ? (
            <p className="leading-relaxed text-muted-foreground">{e.description}</p>
          ) : null}
          <Button asChild variant="outline" className="mt-10">
            <Link to="/events">Back to events</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
