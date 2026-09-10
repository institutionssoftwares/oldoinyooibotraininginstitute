import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { coursesQuery, departmentQuery } from "@/lib/queries";

export const Route = createFileRoute("/departments/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Department | OOTI Loitokitok` },
      {
        name: "description",
        content: `Courses and training offered by the ${params.slug.replace(/-/g, " ")} department at Oldoinyo Oibor Training Institute.`,
      },
      { property: "og:title", content: "OOTI Department" },
      {
        property: "og:description",
        content: "Practical, assessment-ready training programmes at OOTI Loitokitok.",
      },
    ],
  }),
  component: DepartmentDetail,
});

function DepartmentDetail() {
  const { slug } = Route.useParams();
  const department = useQuery(departmentQuery(slug));
  const courses = useQuery(coursesQuery);

  if (department.isLoading) {
    return <div className="container-page section-y text-muted-foreground">Loading…</div>;
  }

  if (!department.data) {
    return (
      <div className="container-page section-y">
        <h1 className="font-display text-2xl font-bold">Department not found</h1>
        <Button asChild className="mt-6">
          <Link to="/departments">Back to departments</Link>
        </Button>
      </div>
    );
  }

  const dept = department.data;
  const deptCourses = (courses.data ?? []).filter((c) => c.department_id === dept.id);

  return (
    <>
      <PageHeader eyebrow="Department" title={dept.name} description={dept.description ?? undefined}>
        <Button asChild variant="gold">
          <Link to="/apply">Apply now</Link>
        </Button>
      </PageHeader>

      <section className="section-y">
        <div className="container-page">
          <h2 className="font-display text-2xl font-bold">Courses in this department</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {deptCourses.map((course) => (
              <Link
                key={course.id}
                to="/courses/$slug"
                params={{ slug: course.slug }}
                className="rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-lift"
              >
                <h3 className="font-display text-base font-semibold">{course.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {[course.duration, course.exam_body].filter(Boolean).join(" · ")}
                </p>
              </Link>
            ))}
            {deptCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Courses for this department will be listed here.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
