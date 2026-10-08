import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const requestSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  account_type: z.enum(["student", "trainer", "staff"]),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const requestPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((d) => requestSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("password_reset_requests").insert({
      full_name: data.full_name,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      account_type: data.account_type,
      note: data.note || null,
    });
    if (error) {
      console.error(error);
      throw new Error("Could not send request. Please try again.");
    }
    return { ok: true };
  });

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (!roles.includes("admin") && !roles.includes("super_admin")) throw new Error("Forbidden");
}

export const listResetRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("password_reset_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const resolveResetRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        action: z.enum(["set_password", "reject"]),
        password: z.string().min(8).max(72).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: req, error } = await supabaseAdmin
      .from("password_reset_requests")
      .select("email")
      .eq("id", data.id)
      .single();
    if (error || !req) throw new Error("Request not found");

    if (data.action === "set_password") {
      if (!data.password) throw new Error("Enter a new password (8+ characters).");
      const { data: prof } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .ilike("email", req.email)
        .maybeSingle();
      if (!prof) throw new Error("No account found with that email.");
      const { error: upErr } = await supabaseAdmin.auth.admin.updateUserById(prof.id, {
        password: data.password,
      });
      if (upErr) throw new Error(upErr.message);
    }
    await supabaseAdmin
      .from("password_reset_requests")
      .update({
        status: data.action === "set_password" ? "done" : "rejected",
        handled_by: context.userId,
        handled_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    return { ok: true };
  });
