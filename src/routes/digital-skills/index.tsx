import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { coursesQuery } from "@/lib/queries";
import { whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/digital-skills/")({
  head: () => ({
    meta: [
      { title: "Digital Skills Training | OOTI Loitokitok" },
      {
        name: "description",
        content:
          "Digital skills for the modern world: computer packages, graphic design, web and software development, digital marketing, AI, freelancing and more at OOTI.",
      },
      { property: "og:title", content: "Digital Skills for the Modern World | OOTI" },
      {
        property: "og:description",
        content:
          "Practical digital skills for employment, freelancing, entrepreneurship and the modern workplace.",
      },
    ],
  }),
  component: DigitalSkills,
});

function DigitalSkills() {
  const courses = useQuery(coursesQuery);
  const digital = (courses.data ?? []).filter((c) => c.category === "Digital Skills");

  return (
    <>
      <PageHeader
        eyebrow="Digital skills"
        title="Digital skills for the modern world"
        description="Build practical digital skills for employment, freelancing, entrepreneurship and the modern workplace."
      >
        <Button asChild variant="gold">
          <Link to="/apply">Apply now</Link>
        </Button>
        <Button asChild variant="onNavy">
          <a
            href={whatsappLink("Hello OOTI, I would like to enquire about digital skills training.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle aria-hidden="true" /> WhatsApp enquiry
          </a>
        </Button>
      </PageHeader>

      <section className="section-y">
        <div className="container-page grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.isLoading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)
            : digital.map((course) => (
                <Link
                  key={course.id}
                  to="/digital-skills/$slug"
                  params={{ slug: course.slug }}
                  className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-lift"
                >
                  <h2 className="font-display text-lg font-semibold group-hover:text-primary">
                    {course.name}
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {course.description ?? "Details for this course are published by the institute."}
                  </p>
                  <span className="mt-4 text-sm font-medium text-primary">View course</span>
                </Link>
              ))}
        </div>
      </section>
    </>
  );
}
