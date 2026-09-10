import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useForm, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { coursesQuery } from "@/lib/queries";
import { applicationSchema, type ApplicationInput, type ApplicationValues } from "@/lib/applications.schema";
import { submitApplication } from "@/lib/applications.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/apply")({
  validateSearch: (search: Record<string, unknown>): { course?: string } =>
    typeof search["course"] === "string" ? { course: search["course"] } : {},
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

const KENYAN_GRADES = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "E"];

function Apply() {
  const { course: courseParam } = Route.useSearch();
  const courses = useQuery(coursesQuery);
  const submit = useServerFn(submitApplication);
  const [reference, setReference] = useState<string | null>(null);

  const form = useForm<ApplicationInput, unknown, ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    mode: "onTouched",
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      national_id: "",
      date_of_birth: "",
      gender: "",
      county: "",
      previous_school: "",
      highest_qualification: "",
      mean_grade: "",
      guardian_name: "",
      guardian_phone: "",
      intake: "",
      notes: "",
      course_slug: courseParam ?? "",
    },
  });
  const { register, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;
  const errorCount = Object.keys(errors).length;

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        void values;
        const result = await submit({ data: form.getValues() });
        setReference(result.reference);
        toast.success("Application submitted");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        toast.error(
          err instanceof Error && err.message
            ? err.message
            : "We could not submit your application. Please try again.",
        );
      }
    },
    () => {
      toast.error("Please fix the highlighted fields.");
      const first = document.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  );

  if (reference) {
    return (
      <section className="section-y">
        <div className="container-page max-w-xl text-center">
          <CheckCircle2 className="mx-auto size-12 text-gold" aria-hidden="true" />
          <h1 className="mt-4 font-display text-3xl font-bold">Application received</h1>
          <p className="mt-3 text-muted-foreground">
            Keep this reference number safe. You will need it, together with your phone number, to
            check your application status.
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
        <form onSubmit={onSubmit} noValidate className="container-page max-w-3xl space-y-10">
          {errorCount > 0 ? (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>
                {errorCount === 1
                  ? "There is 1 field that needs your attention."
                  : `There are ${errorCount} fields that need your attention.`}
              </p>
            </div>
          ) : null}

          <fieldset className="space-y-5">
            <legend className="font-display text-xl font-bold">Personal details</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="full_name" label="Full name *" register={register} errors={errors} autoComplete="name" />
              <Field
                name="phone"
                label="Phone number *"
                type="tel"
                register={register}
                errors={errors}
                placeholder="0712 345 678"
                hint="We use this to verify your identity when you check status."
                autoComplete="tel"
              />
              <Field name="email" label="Email address" type="email" register={register} errors={errors} autoComplete="email" />
              <Field name="national_id" label="National ID number" register={register} errors={errors} />
              <Field name="date_of_birth" label="Date of birth" type="date" register={register} errors={errors} />
              <SelectField name="gender" label="Gender" register={register} errors={errors}>
                <option value="">Select</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </SelectField>
              <Field name="county" label="County" register={register} errors={errors} placeholder="e.g. Kajiado" />
            </div>
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="font-display text-xl font-bold">Education background</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="previous_school" label="Previous school" register={register} errors={errors} />
              <Field
                name="highest_qualification"
                label="Highest qualification"
                register={register}
                errors={errors}
                placeholder="e.g. KCSE, KCPE, Certificate"
              />
              <SelectField name="mean_grade" label="Mean grade" register={register} errors={errors}>
                <option value="">Select</option>
                {KENYAN_GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </SelectField>
            </div>
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="font-display text-xl font-bold">Course selection</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField name="course_slug" label="Course of interest" register={register} errors={errors}>
                <option value="">Select a course</option>
                {(courses.data ?? []).map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </SelectField>
              <Field
                name="intake"
                label="Preferred intake"
                register={register}
                errors={errors}
                placeholder="e.g. January 2026"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="font-display text-xl font-bold">Guardian details</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="guardian_name" label="Guardian name" register={register} errors={errors} />
              <Field name="guardian_phone" label="Guardian phone" type="tel" register={register} errors={errors} />
            </div>
          </fieldset>

          <div className="grid gap-2">
            <Label htmlFor="notes">Anything else we should know?</Label>
            <Textarea
              id="notes"
              rows={4}
              aria-invalid={Boolean(errors.notes) || undefined}
              {...register("notes")}
            />
            <FieldError message={errors.notes?.message} id="notes-error" />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" variant="gold" size="xl" disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit application"}
            </Button>
            <p className="text-sm text-muted-foreground">
              You will receive a reference number immediately after submitting.
            </p>
          </div>
        </form>
      </section>
    </>
  );
}

type FieldProps = {
  name: keyof ApplicationInput;
  label: string;
  register: UseFormRegister<ApplicationInput>;
  errors: FieldErrors<ApplicationInput>;
  type?: string;
  placeholder?: string;
  hint?: string;
  autoComplete?: string;
};

function Field({ name, label, register, errors, type = "text", placeholder, hint, autoComplete }: FieldProps) {
  const message = errors[name]?.message as string | undefined;
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(message) || undefined}
        aria-describedby={message ? errorId : hint ? hintId : undefined}
        className={cn(message && "border-destructive focus-visible:ring-destructive")}
        {...register(name)}
      />
      {message ? (
        <FieldError message={message} id={errorId} />
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  name,
  label,
  register,
  errors,
  children,
}: Omit<FieldProps, "type" | "placeholder" | "hint" | "autoComplete"> & { children: React.ReactNode }) {
  const message = errors[name]?.message as string | undefined;
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        aria-invalid={Boolean(message) || undefined}
        className={cn(
          "h-9 rounded-md border border-input bg-background px-3 text-sm",
          message && "border-destructive",
        )}
        {...register(name)}
      >
        {children}
      </select>
      <FieldError message={message} id={`${name}-error`} />
    </div>
  );
}

function FieldError({ message, id }: { message?: string | undefined; id: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="flex items-center gap-1 text-xs font-medium text-destructive">
      <AlertCircle className="size-3.5" aria-hidden="true" />
      {message}
    </p>
  );
}
