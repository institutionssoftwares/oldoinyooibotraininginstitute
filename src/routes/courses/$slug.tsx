import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { courseQuery } from "@/lib/queries";
import { whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/courses/$slug")({
  head: ({ params }) => {
    const readable = params.slug.replace(/-/g, " ");
    return {
      meta: [
        { title: `${readable} course | OOTI Loitokitok` },
        {
          name: "description",
          content: `Course details, duration, entry requirements and application for ${readable} at Oldoinyo Oibor Training Institute.`,
        },
        { property: "og:title", content: `${readable} at OOTI` },
        {
          property: "og:description",
          content: "Apply online for practical training at OOTI Loitokitok.",
        },
      ],
    };
  },
  component: CourseDetail,
});

function CourseDetail() {
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
          <Link to="/courses">Back to courses</Link>
        </Button>
      </div>
    );
  }

  const c = course.data;
  const details: Array<[string, string | null]> = [
    ["Course code", c.course_code],
    ["Category", c.category],
    ["Duration", c.duration],
    ["Minimum grade", c.minimum_grade],
    ["Entry requirement", c.entry_requirement],
    ["Exam body", c.exam_body],
    ["Level", c.level],
    ["Mode of study", c.mode_of_study],
    ["Intake", c.intake],
    ["Instructor", c.instructor],
    ["Fee", c.fee != null ? `KES ${Number(c.fee).toLocaleString("en-KE")}` : null],
  ];

  return (
    <>
      <PageHeader eyebrow={c.category} title={c.name} description={c.description ?? undefined}>
        {c.accepting_applications ? (
          <Button asChild variant="gold">
            <Link to="/apply" search={{ course: c.slug }}>
              Apply for this course
            </Link>
          </Button>
        ) : null}
        <Button asChild variant="onNavy">
          <a
            href={whatsappLink(`Hello OOTI, I would like to enquire about the ${c.name} course.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle aria-hidden="true" /> WhatsApp enquiry
          </a>
        </Button>
      </PageHeader>

      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="font-display text-2xl font-bold">Course details</h2>
            <dl className="mt-6 divide-y divide-border rounded-xl border border-border bg-card shadow-card">
              {details
                .filter(([, value]) => Boolean(value))
                .map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-6 px-6 py-4 text-sm">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
            </dl>
            {details.every(([, v]) => !v) ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Full details for this course will be published by the institute shortly.
              </p>
            ) : null}
          </div>

          <aside className="h-fit rounded-xl border border-border bg-surface p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold">Ready to join?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Applications are handled online. You will receive a reference number to track your
              application.
            </p>
            <div className="mt-5 grid gap-2">
              <Button asChild variant="gold">
                <Link to="/apply" search={{ course: c.slug }}>
                  Apply now
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/admissions">Admission requirements</Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
