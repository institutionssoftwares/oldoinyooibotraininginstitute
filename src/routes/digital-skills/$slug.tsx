import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { courseQuery } from "@/lib/queries";
import { whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/digital-skills/$slug")({
  head: ({ params }) => {
    const readable = params.slug.replace(/-/g, " ");
    return {
      meta: [
        { title: `${readable} | Digital Skills at OOTI` },
        {
          name: "description",
          content: `Learn ${readable} at Oldoinyo Oibor Training Institute, Loitokitok. Practical digital skills training with online application.`,
        },
        { property: "og:title", content: `${readable} | OOTI Digital Skills` },
        {
          property: "og:description",
          content: "Practical digital skills training at OOTI Loitokitok.",
        },
      ],
    };
  },
  component: DigitalSkillDetail,
});

function DigitalSkillDetail() {
  const { slug } = Route.useParams();
  const course = useQuery(courseQuery(slug));

  if (course.isLoading) {
    return <div className="container-page section-y text-muted-foreground">Loading…</div>;
  }

  if (!course.data) {
    return (
      <div className="container-page section-y">
        <h1 className="font-display text-2xl font-bold">Course not found</h1>
        <Button asChild className="mt-6">
          <Link to="/digital-skills">Back to digital skills</Link>
        </Button>
      </div>
    );
  }

  const c = course.data;
  const details: Array<[string, string | null]> = [
    ["Duration", c.duration],
    ["Requirements", c.entry_requirement],
    ["Fee", c.fee != null ? `KES ${Number(c.fee).toLocaleString("en-KE")}` : null],
    ["Mode", c.mode_of_study],
    ["Instructor", c.instructor],
  ];
  const known = details.filter(([, v]) => Boolean(v));

  return (
    <>
      <PageHeader eyebrow="Digital skills" title={c.name} description={c.description ?? undefined}>
        <Button asChild variant="gold">
          <Link to="/apply" search={{ course: c.slug }}>
            Apply for this course
          </Link>
        </Button>
        <Button asChild variant="onNavy">
          <a
            href={whatsappLink(`Hello OOTI, I would like to enquire about ${c.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle aria-hidden="true" /> WhatsApp enquiry
          </a>
        </Button>
      </PageHeader>

      <section className="section-y">
        <div className="container-page max-w-3xl">
          <h2 className="font-display text-2xl font-bold">Course details</h2>
          {known.length > 0 ? (
            <dl className="mt-6 divide-y divide-border rounded-xl border border-border bg-card shadow-card">
              {known.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-6 px-6 py-4 text-sm">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Duration, fees and requirements for this course are published by the institute. Contact
              the office or send a WhatsApp enquiry for current details.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
