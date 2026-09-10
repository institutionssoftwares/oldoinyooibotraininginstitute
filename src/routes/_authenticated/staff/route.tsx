import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/** Staff-only subtree: requires the admin or staff role (checked again on the server). */
export const Route = createFileRoute("/_authenticated/staff")({
  beforeLoad: async ({ context }) => {
    const { data: isStaff } = await supabase.rpc("is_staff", { _user_id: context.user.id });
    if (!isStaff) throw redirect({ to: "/portal" });
    return { isStaff: true };
  },
  component: () => <Outlet />,
});
