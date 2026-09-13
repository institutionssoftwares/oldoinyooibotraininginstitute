import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GalleryImagesManager } from "@/components/admin/GalleryImagesManager";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { getRow } from "@/lib/admin/api";
import type { ResourceDef } from "@/lib/admin/resources";

export function ResourceEditPage({ def, id }: { def: ResourceDef; id: string }) {
  const navigate = useNavigate();
  const isNew = id === "new";
  const row = useQuery({
    queryKey: ["admin", def.table, id],
    queryFn: () => getRow(def.table, id),
    enabled: !isNew,
  });

  if (!isNew && row.isLoading) return <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>;
  if (!isNew && !row.data) return <p className="py-12 text-center text-sm text-muted-foreground">Not found.</p>;

  const preview = !isNew && row.data && def.previewUrl ? def.previewUrl(row.data) : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" aria-label="Back">
            <Link to="/admin/$resource" params={{ resource: def.key }}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">{isNew ? `New ${def.singular.toLowerCase()}` : `Edit ${def.singular.toLowerCase()}`}</h1>
            <p className="text-sm text-muted-foreground">{def.description}</p>
          </div>
        </div>
        {preview ? (
          <Button asChild variant="outline" size="sm">
            <a href={preview} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" /> Preview on site
            </a>
          </Button>
        ) : null}
      </div>

      <ResourceForm
        def={def}
        initial={isNew ? undefined : (row.data ?? undefined)}
        onSaved={(saved) => {
          if (isNew) void navigate({ to: "/admin/$resource/$id", params: { resource: def.key, id: saved.id } });
        }}
      />

      {!isNew && def.key === "albums" ? <GalleryImagesManager albumId={id} /> : null}
    </div>
  );
}
