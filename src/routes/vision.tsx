import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { INSTITUTION } from "@/lib/site";

export const Route = createFileRoute("/vision")({
  head: () => ({
    meta: [
      { title: "Our Vision | Oldoinyo Oibor Training Institute" },
      {
        name: "description",
        content:
          "The vision of Oldoinyo Oibor Training Institute: to be a leading centre of excellence in technical, vocational and educational training.",
      },
      { property: "og:title", content: "OOTI Vision" },
      {
        property: "og:description",
        content: "A leading centre of excellence in technical and vocational training.",
      },
    ],
  }),
  component: Vision,
});

function Vision() {
  return (
    <>
      <PageHeader eyebrow="Our vision" title="Where we are going" />
      <section className="section-y">
        <div className="container-page max-w-3xl">
          <p className="font-display text-xl leading-relaxed sm:text-2xl">{INSTITUTION.vision}</p>
          <p className="mt-8 text-muted-foreground">Motto: {INSTITUTION.motto}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="gold">
              <Link to="/mission">Our mission</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/courses">Explore courses</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
