import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { INSTITUTION } from "@/lib/site";

export const Route = createFileRoute("/mission")({
  head: () => ({
    meta: [
      { title: "Our Mission | Oldoinyo Oibor Training Institute" },
      {
        name: "description",
        content:
          "The mission of Oldoinyo Oibor Training Institute: quality technical and vocational education, training and competencies for the labour market.",
      },
      { property: "og:title", content: "OOTI Mission" },
      {
        property: "og:description",
        content: "Quality technical and vocational education, training and competencies.",
      },
    ],
  }),
  component: Mission,
});

function Mission() {
  return (
    <>
      <PageHeader eyebrow="Our mission" title="What we set out to do" />
      <section className="section-y">
        <div className="container-page max-w-3xl">
          <p className="font-display text-xl leading-relaxed sm:text-2xl">{INSTITUTION.mission}</p>
          <p className="mt-8 text-muted-foreground">
            Every programme, workshop session and assessment at OOTI is measured against this
            mission.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="gold">
              <Link to="/vision">Our vision</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/about">About OOTI</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
