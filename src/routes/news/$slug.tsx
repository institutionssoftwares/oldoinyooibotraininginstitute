import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { newsPostQuery } from "@/lib/queries";

export const Route = createFileRoute("/news/$slug")({
  head: ({ params }) => {
    const readable = params.slug.replace(/-/g, " ");
    return {
      meta: [
        { title: `${readable} | OOTI News` },
        {
          name: "description",
          content: `${readable} — news and announcements from Oldoinyo Oibor Training Institute, Loitokitok.`,
        },
        { property: "og:title", content: `${readable} | OOTI News` },
        { property: "og:description", content: "News from OOTI Loitokitok." },
      ],
    };
  },
  component: NewsPost,
});

function NewsPost() {
  const { slug } = Route.useParams();
  const post = useQuery(newsPostQuery(slug));

  if (post.isLoading) {
    return <div className="container-page section-y text-muted-foreground">Loading…</div>;
  }

  if (!post.data) {
    return (
      <div className="container-page section-y">
        <h1 className="font-display text-2xl font-bold">Article not found</h1>
        <Button asChild className="mt-6">
          <Link to="/news">Back to news</Link>
        </Button>
      </div>
    );
  }

  const p = post.data;

  return (
    <>
      <PageHeader
        eyebrow={
          p.published_at
            ? new Date(p.published_at).toLocaleDateString("en-KE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "News"
        }
        title={p.title}
        description={p.excerpt ?? undefined}
      />
      <article className="section-y">
        <div className="container-page max-w-3xl">
          {p.image_url ? (
            <img
              src={p.image_url}
              alt=""
              className="mb-8 max-h-[36rem] w-full rounded-xl bg-navy/5 object-contain shadow-card"
              loading="lazy"
            />
          ) : null}
          {p.body ? (
            <div className="space-y-4 leading-relaxed text-muted-foreground">
              {p.body.split(/\n{2,}/).map((paragraph: string, i: number) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          ) : null}
          <Button asChild variant="outline" className="mt-10">
            <Link to="/news">Back to news</Link>
          </Button>
        </div>
      </article>
    </>
  );
}
