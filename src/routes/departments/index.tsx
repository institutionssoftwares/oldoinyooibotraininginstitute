import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { coursesQuery, departmentsQuery } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/departments/")({
  head: () => ({
    meta: [
      { title: "Departments | Oldoinyo Oibor Training Institute" },
      {
        name: "description",
        content:
          "Explore OOTI departments: building and plumbing, cosmetology, electrical engineering, computing and informatics, and digital skills.",
      },
      { property: "og:title", content: "OOTI Departments" },
      {
        property: "og:description",
        content: "Five training departments covering technical, vocational and digital skills.",
      },
    ],
  }),
  component: Departments,
});

function Departments() {
  const departments = useQuery(departmentsQuery);
  const courses = useQuery(coursesQuery);

  return (
    <>
      <PageHeader
        eyebrow="Departments"
        title="Training departments"
        description="Each department runs practical, assessment-ready programmes led by trainers in the field."
      />
      <section className="section-y">
        <div className="container-page grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {departments.isLoading
            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)
            : (departments.data ?? []).map((dept) => {
                const count = (courses.data ?? []).filter(
                  (c) => c.department_id === dept.id,
                ).length;
                return (
                  <Link
                    key={dept.id}
                    to="/departments/$slug"
                    params={{ slug: dept.slug }}
                    className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-lift"
                  >
                    <h2 className="font-display text-lg font-semibold group-hover:text-primary">
                      {dept.name}
                    </h2>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground">{dept.description}</p>
                    <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                      {count} {count === 1 ? "course" : "courses"}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </p>
                  </Link>
                );
              })}
        </div>
      </section>
    </>
  );
}
