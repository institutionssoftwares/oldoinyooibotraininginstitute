import { createFileRoute, notFound } from "@tanstack/react-router";

import { ResourceEditPage } from "@/components/admin/ResourceEditPage";
import { RESOURCES } from "@/lib/admin/resources";

export const Route = createFileRoute("/_authenticated/admin/$resource/new")({
  beforeLoad: ({ params }) => {
    if (!RESOURCES[params.resource]) throw notFound();
  },
  component: () => {
    const { resource } = Route.useParams();
    return <ResourceEditPage def={RESOURCES[resource]!} id="new" />;
  },
});
