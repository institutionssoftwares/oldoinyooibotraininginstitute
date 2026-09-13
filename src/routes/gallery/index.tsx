import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/site/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { albumsQuery } from "@/lib/queries";

export const Route = createFileRoute("/gallery/")({
  head: () => ({
    meta: [
      { title: "Gallery | OOTI Loitokitok" },
      {
        name: "description",
        content:
          "Photo albums from Oldoinyo Oibor Training Institute: workshops, classrooms, practical sessions and campus life in Loitokitok.",
      },
      { property: "og:title", content: "OOTI Photo Gallery" },
      { property: "og:description", content: "Campus life and practical training in pictures." },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const albums = useQuery(albumsQuery);
  const list = albums.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="Life at OOTI"
        description="Photos from workshops, classrooms, practical sessions and campus activities."
      />
      <section className="section-y">
        <div className="container-page">
          {albums.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-xl" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              Photo albums will appear here once the institute publishes them.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((album) => (
                <Link
                  key={album.id}
                  to="/gallery/$slug"
                  params={{ slug: album.slug }}
                  className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-lift"
                >
                  {album.cover_url ? (
                    <img
                      src={album.cover_url}
                      alt=""
                      className="max-h-72 w-full bg-navy/5 object-contain"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="p-6">
                    <h2 className="font-display text-lg font-semibold group-hover:text-primary">
                      {album.title}
                    </h2>
                    {album.description ? (
                      <p className="mt-2 text-sm text-muted-foreground">{album.description}</p>
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
