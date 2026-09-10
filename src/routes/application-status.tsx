import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/application-status")({
  validateSearch: (search: Record<string, unknown>): { reference?: string } =>
    typeof search["reference"] === "string" ? { reference: search["reference"] } : {},
  head: () => ({
    meta: [
      { title: "Check Application Status | OOTI Loitokitok" },
      {
        name: "description",
        content:
          "Track your Oldoinyo Oibor Training Institute application using your reference number and phone number.",
      },
      { property: "og:title", content: "Check Your OOTI Application Status" },
      {
        property: "og:description",
        content: "Enter your reference number and phone number to see your admission status.",
      },
    ],
  }),
  component: ApplicationStatus,
});

type Result =
  | { kind: "found"; fullName: string; course: string | null; status: string; submitted: string }
  | { kind: "none" };

function ApplicationStatus() {
  const { reference: prefill } = Route.useSearch();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const reference = String(form.get("reference") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    if (!reference || !phone) return;

    setLoading(true);
    const { data } = await supabase
      .from("applications")
      .select("full_name, course_name, status, created_at")
      .eq("reference", reference)
      .eq("phone", phone)
      .maybeSingle();
    setLoading(false);

    setResult(
      data
        ? {
            kind: "found",
            fullName: data.full_name,
            course: data.course_name,
            status: data.status,
            submitted: new Date(data.created_at).toLocaleDateString("en-KE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          }
        : { kind: "none" },
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Application status"
        title="Track your application"
        description="Enter the reference number you received when you applied, together with the phone number you used."
      />

      <section className="section-y">
        <div className="container-page max-w-xl">
          <form
            onSubmit={onSubmit}
            className="grid gap-5 rounded-xl border border-border bg-card p-8 shadow-card"
          >
            <div className="grid gap-2">
              <Label htmlFor="reference">Reference number</Label>
              <Input
                id="reference"
                name="reference"
                defaultValue={prefill ?? ""}
                placeholder="OOTI-2026-00001"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone number used</Label>
              <Input id="phone" name="phone" type="tel" required />
            </div>
            <Button type="submit" variant="gold" disabled={loading}>
              {loading ? "Checking…" : "Check status"}
            </Button>
          </form>

          {result?.kind === "found" ? (
            <div className="mt-6 rounded-xl border border-border bg-surface p-8 shadow-card">
              <p className="eyebrow">Application found</p>
              <h2 className="mt-2 font-display text-2xl font-bold">{result.fullName}</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Course</dt>
                  <dd className="font-medium">{result.course ?? "Not specified"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Submitted</dt>
                  <dd className="font-medium">{result.submitted}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-semibold capitalize text-primary">{result.status}</dd>
                </div>
              </dl>
            </div>
          ) : null}

          {result?.kind === "none" ? (
            <p className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              We could not find an application with that reference number and phone number. Check the
              details and try again, or contact the institute for help.
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
