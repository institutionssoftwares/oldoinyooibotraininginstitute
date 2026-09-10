import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { documentsQuery } from "@/lib/queries";

export const Route = createFileRoute("/downloads")({
  head: () => ({
    meta: [
      { title: "Downloads | OOTI Loitokitok" },
      {
        name: "description",
        content:
          "Download the OOTI brochure, application forms, fee structures and other official documents from Oldoinyo Oibor Training Institute.",
      },
      { property: "og:title", content: "OOTI Downloads" },
      { property: "og:description", content: "Brochures, forms and official institute documents." },
    ],
  }),
  component: Downloads,
});

function Downloads() {
  const documents = useQuery(documentsQuery);
  const list = documents.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Downloads"
        title="Documents & forms"
        description="Official documents published by the institute."
      />
      <section className="section-y">
        <div className="container-page">
          {documents.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              No documents have been published yet. Brochures and forms will appear here once
              uploaded by the institute.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {list.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-lift"
                >
                  <FileText className="mt-1 size-5 shrink-0 text-gold" aria-hidden="true" />
                  <div className="flex-1">
                    <h2 className="font-display text-base font-semibold">{doc.title}</h2>
                    {doc.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{doc.description}</p>
                    ) : null}
                    {doc.category ? (
                      <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                        {doc.category}
                      </p>
                    ) : null}
                  </div>
                  <Download className="mt-1 size-4 text-muted-foreground" aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
