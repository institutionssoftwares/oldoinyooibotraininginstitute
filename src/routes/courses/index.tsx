import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { coursesQuery, departmentsQuery } from "@/lib/queries";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Courses | OOTI Loitokitok Technical & Vocational Training" },
      {
        name: "description",
        content:
          "Browse NITA and CDACC courses at Oldoinyo Oibor Training Institute: plumbing, cosmetology, electrical, ICT, short courses and digital skills.",
      },
      { property: "og:title", content: "Courses at OOTI Loitokitok" },
      {
        property: "og:description",
        content: "Technical, vocational, computing, short and digital skills courses.",
      },
    ],
  }),
  component: Courses,
});

const CATEGORIES = ["All", "Technical", "Vocational", "Computing", "Short Course", "Digital Skills"];

function Courses() {
  const courses = useQuery(coursesQuery);
  const departments = useQuery(departmentsQuery);
  const [category, setCategory] = useState("All");
  const [term, setTerm] = useState("");

  const deptName = useMemo(() => {
    const map = new Map<string, string>();
    (departments.data ?? []).forEach((d) => map.set(d.id, d.name));
    return map;
  }, [departments.data]);

  const filtered = (courses.data ?? []).filter((c) => {
    const matchesCategory = category === "All" || c.category === category;
    const matchesTerm = c.name.toLowerCase().includes(term.trim().toLowerCase());
    return matchesCategory && matchesTerm;
  });

  return (
    <>
      <PageHeader
        eyebrow="Courses"
        title="Find the course that fits you"
        description="Artisan grades, competency-based levels, short courses and digital skills — all open for application."
      />

      <section className="section-y">
        <div className="container-page">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant={category === c ? "default" : "outline"}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
            <div className="relative w-full lg:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search courses"
                aria-label="Search courses"
                className="pl-9"
              />
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 rounded-xl" />
                ))
              : filtered.map((course) => (
                  <Link
                    key={course.id}
                    to={course.category === "Digital Skills" ? "/digital-skills/$slug" : "/courses/$slug"}
                    params={{ slug: course.slug }}
                    className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-lift"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                        {course.category}
                      </span>
                      {course.exam_body ? (
                        <span className="text-xs font-semibold text-gold">{course.exam_body}</span>
                      ) : null}
                    </div>
                    <h2 className="mt-3 font-display text-lg font-semibold group-hover:text-primary">
                      {course.name}
                    </h2>
                    {course.department_id ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {deptName.get(course.department_id)}
                      </p>
                    ) : null}
                    <dl className="mt-4 space-y-1 text-sm text-muted-foreground">
                      {course.duration ? (
                        <div className="flex justify-between gap-3">
                          <dt>Duration</dt>
                          <dd className="font-medium text-foreground">{course.duration}</dd>
                        </div>
                      ) : null}
                      {course.minimum_grade ? (
                        <div className="flex justify-between gap-3">
                          <dt>Minimum grade</dt>
                          <dd className="font-medium text-foreground">{course.minimum_grade}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </Link>
                ))}
          </div>

          {!courses.isLoading && filtered.length === 0 ? (
            <p className="mt-10 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No courses match your search yet.
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
