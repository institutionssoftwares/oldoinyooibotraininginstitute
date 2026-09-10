import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Quote } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { storiesQuery } from "@/lib/queries";

export const Route = createFileRoute("/student-success")({
  head: () => ({
    meta: [
      { title: "Student Success Stories | OOTI Loitokitok" },
      {
        name: "description",
        content:
          "Stories from OOTI graduates working in plumbing, electrical installation, beauty, computing and self-employment across Kenya.",
      },
      { property: "og:title", content: "OOTI Student Success Stories" },
      { property: "og:description", content: "Where OOTI training has taken our graduates." },
    ],
  }),
  component: StudentSuccess,
});

function StudentSuccess() {
  const stories = useQuery(storiesQuery);
  const list = stories.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Student success"
        title="Where our graduates go"
        description="Real stories from trainees who completed their programmes at OOTI."
      >
        <Button asChild variant="gold">
          <Link to="/apply">Start your journey</Link>
        </Button>
      </PageHeader>
      <section className="section-y">
        <div className="container-page">
          {stories.isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              Success stories will be published here as graduates share them with the institute.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {list.map((story) => (
                <article
                  key={story.id}
                  className="rounded-xl border border-border bg-card p-8 shadow-card"
                >
                  <Quote className="size-6 text-gold" aria-hidden="true" />
                  <p className="mt-4 leading-relaxed text-muted-foreground">{story.story}</p>
                  <div className="mt-6 flex items-center gap-3">
                    {story.photo_url ? (
                      <img
                        src={story.photo_url}
                        alt={story.student_name}
                        className="size-12 rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                    <div>
                      <p className="font-display font-semibold">{story.student_name}</p>
                      {story.course_name ? (
                        <p className="text-sm text-muted-foreground">{story.course_name}</p>
                      ) : null}
                    </div>
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
