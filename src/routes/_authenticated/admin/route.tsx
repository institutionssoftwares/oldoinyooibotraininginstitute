import { createFileRoute, redirect } from "@tanstack/react-router";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { fetchRoles } from "@/hooks/use-permissions";
import { derivePermissions } from "@/lib/admin/resources";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const permissions = derivePermissions(await fetchRoles(context.user.id));
    if (!permissions.portalStaff) throw redirect({ to: "/portal" });
    return { permissions };
  },
  component: AdminLayoutRoute,
});

function AdminLayoutRoute() {
  const { permissions } = Route.useRouteContext();
  return <AdminLayout permissions={permissions} />;
}
