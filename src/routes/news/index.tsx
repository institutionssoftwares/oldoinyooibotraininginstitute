import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/site/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { newsQuery } from "@/lib/queries";

export const Route = createFileRoute("/news/")({
  head: () => ({
    meta: [
      { title: "News & Announcements | OOTI Loitokitok" },
      {
        name: "description",
        content:
          "Latest news, intake announcements and updates from Oldoinyo Oibor Training Institute, Loitokitok.",
      },
      { property: "og:title", content: "OOTI News & Announcements" },
      {
        property: "og:description",
        content: "Intake announcements and institute updates from OOTI Loitokitok.",
      },
    ],
  }),
  component: News,
});

function News() {
  const news = useQuery(newsQuery);

  return (
    <>
      <PageHeader
        eyebrow="News"
        title="News & announcements"
        description="Intake announcements, institute updates and stories from around campus."
      />
      <section className="section-y">
        <div className="container-page">
          {news.isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-xl" />
              ))}
            </div>
          ) : (news.data ?? []).length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              No news has been published yet. Announcements will appear here as soon as the institute
              posts them.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(news.data ?? []).map((post) => (
                <Link
                  key={post.id}
                  to="/news/$slug"
                  params={{ slug: post.slug }}
                  className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-lift"
                >
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt=""
                      className="max-h-64 w-full bg-navy/5 object-contain"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="p-6">
                    {post.published_at ? (
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.published_at).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    ) : null}
                    <h2 className="mt-2 font-display text-lg font-semibold group-hover:text-primary">
                      {post.title}
                    </h2>
                    {post.excerpt ? (
                      <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
