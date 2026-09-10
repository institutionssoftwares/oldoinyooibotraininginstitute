import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { statusLookupSchema, STATUS_HELP, STATUS_LABELS } from "@/lib/applications.schema";
import { checkApplicationStatus } from "@/lib/applications.functions";
import { cn } from "@/lib/utils";

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

type Lookup = z.input<typeof statusLookupSchema>;
type Result = Awaited<ReturnType<typeof checkApplicationStatus>>;

const STATUS_TONE: Record<string, string> = {
  submitted: "bg-secondary text-secondary-foreground",
  under_review: "bg-gold/15 text-foreground",
  accepted: "bg-primary text-primary-foreground",
  rejected: "bg-destructive/10 text-destructive",
  waitlisted: "bg-muted text-muted-foreground",
};

function ApplicationStatus() {
  const { reference: prefill } = Route.useSearch();
  const lookup = useServerFn(checkApplicationStatus);
  const [result, setResult] = useState<Result | "none" | null>(null);
  const [failed, setFailed] = useState(false);

  const { register, handleSubmit, formState } = useForm<Lookup>({
    resolver: zodResolver(statusLookupSchema),
    mode: "onTouched",
    defaultValues: { reference: prefill ?? "", phone: "" },
  });
  const { errors, isSubmitting } = formState;

  const onSubmit = handleSubmit(async (values) => {
    setFailed(false);
    try {
      const data = await lookup({ data: values });
      setResult(data ?? "none");
    } catch {
      setFailed(true);
    }
  });

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });

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
            noValidate
            className="grid gap-5 rounded-xl border border-border bg-card p-8 shadow-card"
          >
            <div className="grid gap-2">
              <Label htmlFor="reference">Reference number</Label>
              <Input
                id="reference"
                placeholder="OOTI-2026-00001"
                autoCapitalize="characters"
                aria-invalid={Boolean(errors.reference) || undefined}
                className={cn(errors.reference && "border-destructive")}
                {...register("reference")}
              />
              <FieldError message={errors.reference?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone number used</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0712 345 678"
                aria-invalid={Boolean(errors.phone) || undefined}
                className={cn(errors.phone && "border-destructive")}
                {...register("phone")}
              />
              <FieldError message={errors.phone?.message} />
            </div>
            <Button type="submit" variant="gold" disabled={isSubmitting}>
              {isSubmitting ? "Checking…" : "Check status"}
            </Button>
          </form>

          {failed ? (
            <p role="alert" className="mt-6 rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive">
              Something went wrong while checking. Please try again in a moment.
            </p>
          ) : null}

          {result && result !== "none" ? (
            <div className="mt-6 rounded-xl border border-border bg-surface p-8 shadow-card">
              <p className="eyebrow">Application found</p>
              <h2 className="mt-2 font-display text-2xl font-bold">{result.fullName}</h2>
              <span
                className={cn(
                  "mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                  STATUS_TONE[result.status],
                )}
              >
                {STATUS_LABELS[result.status]}
              </span>
              <p className="mt-3 text-sm text-muted-foreground">{STATUS_HELP[result.status]}</p>
              <dl className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
                <Row label="Course" value={result.course ?? "Not specified"} />
                <Row label="Preferred intake" value={result.intake ?? "Not specified"} />
                <Row label="Submitted" value={fmt(result.submittedAt)} />
                <Row label="Last updated" value={fmt(result.updatedAt)} />
              </dl>
            </div>
          ) : null}

          {result === "none" ? (
            <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              <p>
                We could not find an application with that reference number and phone number. Check
                the details and try again, or{" "}
                <Link to="/contact" className="font-medium text-primary hover:underline">
                  contact the institute
                </Link>{" "}
                for help.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-center gap-1 text-xs font-medium text-destructive">
      <AlertCircle className="size-3.5" aria-hidden="true" />
      {message}
    </p>
  );
}
