import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { derivePermissions } from "@/lib/admin/resources";

export async function fetchRoles(userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.role as string);
}

export function usePermissions(userId: string) {
  return useQuery({
    queryKey: ["roles", userId],
    queryFn: async () => derivePermissions(await fetchRoles(userId)),
    staleTime: 60_000,
  });
}
