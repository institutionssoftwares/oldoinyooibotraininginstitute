import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { albumQuery } from "@/lib/queries";

export const Route = createFileRoute("/gallery/$slug")({
  head: ({ params }) => {
    const readable = params.slug.replace(/-/g, " ");
    return {
      meta: [
        { title: `${readable} album | OOTI Gallery` },
        {
          name: "description",
          content: `Photos from ${readable} at Oldoinyo Oibor Training Institute, Loitokitok.`,
        },
        { property: "og:title", content: `${readable} | OOTI Gallery` },
        { property: "og:description", content: "Photos from OOTI Loitokitok." },
      ],
    };
  },
  component: Album,
});

function Album() {
  const { slug } = Route.useParams();
  const album = useQuery(albumQuery(slug));

  if (album.isLoading) {
    return <div className="container-page section-y text-muted-foreground">Loading…</div>;
  }

  if (!album.data) {
    return (
      <div className="container-page section-y">
        <h1 className="font-display text-2xl font-bold">Album not found</h1>
        <Button asChild className="mt-6">
          <Link to="/gallery">Back to gallery</Link>
        </Button>
      </div>
    );
  }

  const images = album.data.gallery_images ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Album"
        title={album.data.title}
        description={album.data.description ?? undefined}
      />
      <section className="section-y">
        <div className="container-page">
          {images.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              No photos have been added to this album yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <figure key={image.id} className="overflow-hidden rounded-xl shadow-card">
                  <img
                    src={image.image_url}
                    alt={image.caption ?? ""}
                    className="max-h-[32rem] w-full bg-navy/5 object-contain"
                    loading="lazy"
                  />
                  {image.caption ? (
                    <figcaption className="bg-card px-4 py-3 text-sm text-muted-foreground">
                      {image.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          )}
          <Button asChild variant="outline" className="mt-10">
            <Link to="/gallery">Back to gallery</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
