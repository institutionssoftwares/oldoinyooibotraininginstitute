import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  APPLICATION_STATUSES,
  applicationSchema,
  statusLookupSchema,
  type ApplicationStatus,
} from "./applications.schema";

/**
 * Public: submit an admissions application. Input is validated with zod and the
 * row is written server-side so the reference number can be returned safely
 * without exposing the applications table to anonymous reads.
 */
export const submitApplication = createServerFn({ method: "POST" })
  .validator((input: unknown) => applicationSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let course: { id: string; name: string } | null = null;
    if (data.course_slug) {
      const { data: c } = await supabaseAdmin
        .from("courses")
        .select("id, name")
        .eq("slug", data.course_slug)
        .eq("published", true)
        .eq("archived", false)
        .maybeSingle();
      course = c;
    }

    const { data: row, error } = await supabaseAdmin
      .from("applications")
      .insert({
        full_name: data.full_name,
        phone: data.phone,
        email: data.email ?? null,
        national_id: data.national_id ?? null,
        date_of_birth: data.date_of_birth ?? null,
        gender: data.gender ?? null,
        county: data.county ?? null,
        previous_school: data.previous_school ?? null,
        highest_qualification: data.highest_qualification ?? null,
        mean_grade: data.mean_grade ?? null,
        guardian_name: data.guardian_name ?? null,
        guardian_phone: data.guardian_phone ?? null,
        intake: data.intake ?? null,
        notes: data.notes ?? null,
        course_id: course?.id ?? null,
        course_name: course?.name ?? null,
        status: "submitted",
      })
      .select("reference")
      .single();

    if (error || !row) {
      console.error("[applications] insert failed", error);
      throw new Error("We could not save your application. Please try again.");
    }
    return { reference: row.reference };
  });

/**
 * Public: look up an application by reference + phone. Both must match, and only
 * non-sensitive fields are returned.
 */
export const checkApplicationStatus = createServerFn({ method: "POST" })
  .validator((input: unknown) => statusLookupSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("applications")
      .select("full_name, course_name, status, created_at, updated_at, intake")
      .eq("reference", data.reference)
      .eq("phone", data.phone)
      .maybeSingle();

    if (!row) return null;
    return {
      fullName: row.full_name,
      course: row.course_name,
      intake: row.intake,
      status: row.status as ApplicationStatus,
      submittedAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });

async function assertStaff(ctx: { supabase: any; userId: string }) {
  const { data: isStaff } = await ctx.supabase.rpc("is_staff", { _user_id: ctx.userId });
  if (!isStaff) throw new Error("Forbidden: staff access only");
}

/** Staff: list applications (RLS also enforces staff visibility). */
export const listApplications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        status: z.enum(APPLICATION_STATUSES).optional(),
        search: z.string().trim().max(80).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    let q = context.supabase
      .from("applications")
      .select(
        "id, reference, full_name, phone, email, course_name, intake, county, mean_grade, highest_qualification, status, created_at, reviewed_at, notes",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.status) q = q.eq("status", data.status);
    if (data.search) {
      const s = data.search.replace(/[%,]/g, "");
      q = q.or(`full_name.ilike.%${s}%,reference.ilike.%${s}%,phone.ilike.%${s}%`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows;
  });

/** Staff: update an application's status. */
export const updateApplicationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(APPLICATION_STATUSES) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase
      .from("applications")
      .update({
        status: data.status,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Signed-in: who am I + am I staff (for the portal shell). */
export const getMyPortalContext = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: isStaff }, { data: profile }, { data: roles }] = await Promise.all([
      context.supabase.rpc("is_staff", { _user_id: context.userId }),
      context.supabase.from("profiles").select("full_name, email, phone").eq("id", context.userId).maybeSingle(),
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
    ]);
    const { count } = await context.supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "submitted");
    return {
      isStaff: Boolean(isStaff),
      profile,
      roles: (roles ?? []).map((r: { role: string }) => r.role),
      pendingApplications: isStaff ? (count ?? 0) : 0,
    };
  });
