import { createFileRoute, notFound } from "@tanstack/react-router";

import { DataTable } from "@/components/admin/DataTable";
import { RESOURCES } from "@/lib/admin/resources";

export const Route = createFileRoute("/_authenticated/admin/$resource/")({
  beforeLoad: ({ params }) => {
    if (!RESOURCES[params.resource]) throw notFound();
  },
  component: ResourceListRoute,
});

function ResourceListRoute() {
  const { resource } = Route.useParams();
  const def = RESOURCES[resource]!;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">{def.label}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{def.description}</p>
      </div>
      <DataTable def={def} />
    </div>
  );
}
