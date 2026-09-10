import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { coursesQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/apply")({
  validateSearch: (search: Record<string, unknown>) => ({
    course: typeof search["course"] === "string" ? (search["course"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Apply Online | OOTI Loitokitok" },
      {
        name: "description",
        content:
          "Apply online to Oldoinyo Oibor Training Institute. Fill the application form and receive a reference number to track your admission.",
      },
      { property: "og:title", content: "Apply Online to OOTI" },
      {
        property: "og:description",
        content: "Submit your application and track it with a reference number.",
      },
    ],
  }),
  component: Apply,
});

function Apply() {
  const { course: courseParam } = Route.useSearch();
  const courses = useQuery(coursesQuery);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (key: string) => {
      const raw = form.get(key);
      const str = typeof raw === "string" ? raw.trim() : "";
      return str.length > 0 ? str : null;
    };

    const fullName = value("full_name");
    const phone = value("phone");
    if (!fullName || !phone) {
      toast.error("Your name and phone number are required.");
      return;
    }

    const courseSlug = value("course_slug");
    const selected = (courses.data ?? []).find((c) => c.slug === courseSlug);

    setSubmitting(true);
    const { data, error } = await supabase
      .from("applications")
      .insert({
        full_name: fullName,
        phone,
        email: value("email"),
        national_id: value("national_id"),
        date_of_birth: value("date_of_birth"),
        gender: value("gender"),
        county: value("county"),
        previous_school: value("previous_school"),
        highest_qualification: value("highest_qualification"),
        mean_grade: value("mean_grade"),
        guardian_name: value("guardian_name"),
        guardian_phone: value("guardian_phone"),
        intake: value("intake"),
        notes: value("notes"),
        course_id: selected?.id ?? null,
        course_name: selected?.name ?? null,
      })
      .select("reference")
      .single();
    setSubmitting(false);

    if (error) {
      toast.error("We could not submit your application. Please try again.");
      return;
    }

    setReference(data.reference);
    toast.success("Application submitted");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (reference) {
    return (
      <section className="section-y">
        <div className="container-page max-w-xl text-center">
          <CheckCircle2 className="mx-auto size-12 text-gold" aria-hidden="true" />
          <h1 className="mt-4 font-display text-3xl font-bold">Application received</h1>
          <p className="mt-3 text-muted-foreground">
            Keep this reference number safe. You will need it to check your application status.
          </p>
          <p className="mt-6 rounded-xl border border-border bg-surface px-6 py-4 font-display text-2xl font-bold tracking-wide">
            {reference}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold">
              <Link to="/application-status" search={{ reference }}>
                Check status
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Back home</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Application"
        title="Apply to OOTI"
        description="Fill in your details below. Fields marked with * are required."
      />

      <section className="section-y">
        <form onSubmit={onSubmit} className="container-page max-w-3xl space-y-10">
          <fieldset className="space-y-5">
            <legend className="font-display text-xl font-bold">Personal details</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="full_name" label="Full name *" required />
              <Field name="phone" label="Phone number *" type="tel" required />
              <Field name="email" label="Email address" type="email" />
              <Field name="national_id" label="National ID number" />
              <Field name="date_of_birth" label="Date of birth" type="date" />
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
              <Field name="county" label="County" />
            </div>
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="font-display text-xl font-bold">Education background</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="previous_school" label="Previous school" />
              <Field name="highest_qualification" label="Highest qualification" />
              <Field name="mean_grade" label="Mean grade" />
            </div>
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="font-display text-xl font-bold">Course selection</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="course_slug">Course of interest</Label>
                <select
                  id="course_slug"
                  name="course_slug"
                  defaultValue={courseParam ?? ""}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select a course</option>
                  {(courses.data ?? []).map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <Field name="intake" label="Preferred intake" placeholder="e.g. January 2026" />
            </div>
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="font-display text-xl font-bold">Guardian details</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="guardian_name" label="Guardian name" />
              <Field name="guardian_phone" label="Guardian phone" type="tel" />
            </div>
          </fieldset>

          <div className="grid gap-2">
            <Label htmlFor="notes">Anything else we should know?</Label>
            <Textarea id="notes" name="notes" rows={4} />
          </div>

          <Button type="submit" variant="gold" size="xl" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit application"}
          </Button>
        </form>
      </section>
    </>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} placeholder={placeholder} />
    </div>
  );
}
