import { z } from "zod";

/** Normalise Kenyan phone numbers to the 07XXXXXXXX / 01XXXXXXXX form. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[\s\-()]/g, "");
  if (/^\+?254[17]\d{8}$/.test(digits)) return `0${digits.replace(/^\+?254/, "")}`;
  return digits;
}

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .transform(normalizePhone)
  .refine((v) => /^0[17]\d{8}$/.test(v), "Enter a valid Kenyan phone number, e.g. 0712 345 678");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .transform((v) => (v.length ? v : null))
    .nullable()
    .optional();

export const applicationSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, "Enter your full name")
    .max(120, "Name must be 120 characters or fewer"),
  phone: phoneSchema,
  email: z
    .string()
    .trim()
    .max(255)
    .transform((v) => (v.length ? v : null))
    .nullable()
    .optional()
    .refine((v) => v == null || z.string().email().safeParse(v).success, "Enter a valid email address"),
  national_id: optionalText(20),
  date_of_birth: z
    .string()
    .trim()
    .transform((v) => (v.length ? v : null))
    .nullable()
    .optional()
    .refine((v) => {
      if (v == null) return true;
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return false;
      const age = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
      return age >= 14 && age <= 90;
    }, "Enter a valid date of birth (applicants must be at least 14)"),
  gender: z
    .enum(["", "Female", "Male"])
    .nullable()
    .optional()
    .transform((v) => (v ? v : null)),
  county: optionalText(60),
  previous_school: optionalText(120),
  highest_qualification: optionalText(80),
  mean_grade: optionalText(10),
  guardian_name: optionalText(120),
  guardian_phone: z
    .string()
    .trim()
    .transform((v) => (v.length ? normalizePhone(v) : null))
    .nullable()
    .optional()
    .refine((v) => v == null || /^0[17]\d{8}$/.test(v), "Enter a valid guardian phone number"),
  intake: optionalText(40),
  notes: optionalText(1000),
  course_slug: z.string().trim().max(120).optional(),
});

export type ApplicationInput = z.input<typeof applicationSchema>;
export type ApplicationValues = z.output<typeof applicationSchema>;

export const statusLookupSchema = z.object({
  reference: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^OOTI-\d{4}-\d{5}$/, "Reference numbers look like OOTI-2026-00001"),
  phone: phoneSchema,
});

export const APPLICATION_STATUSES = [
  "submitted",
  "under_review",
  "accepted",
  "rejected",
  "waitlisted",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  accepted: "Accepted",
  rejected: "Not successful",
  waitlisted: "Waitlisted",
};

export const STATUS_HELP: Record<ApplicationStatus, string> = {
  submitted: "We have received your application. The admissions office will review it shortly.",
  under_review: "Your application is being reviewed by the admissions office.",
  accepted: "Congratulations! You have been offered a place. The office will contact you with next steps.",
  rejected: "Unfortunately your application was not successful this time. Contact the office for guidance.",
  waitlisted: "You are on the waiting list. We will contact you if a place becomes available.",
};
