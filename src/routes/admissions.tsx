import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, FileCheck2, GraduationCap, Send } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { INSTITUTION, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/admissions")({
  head: () => ({
    meta: [
      { title: "Admissions | Apply to OOTI Loitokitok" },
      {
        name: "description",
        content:
          "How to apply to Oldoinyo Oibor Training Institute: application steps, requirements, documents needed and how to track your application status.",
      },
      { property: "og:title", content: "Admissions at OOTI Loitokitok" },
      {
        property: "og:description",
        content: "Apply online in minutes and track your application with a reference number.",
      },
    ],
  }),
  component: Admissions,
});

const STEPS = [
  {
    icon: ClipboardList,
    title: "1. Choose a course",
    body: "Browse the departments, courses and digital skills programmes and pick the one that matches your goals.",
  },
  {
    icon: Send,
    title: "2. Submit your application",
    body: "Complete the online application form with your personal details, qualifications and preferred intake.",
  },
  {
    icon: FileCheck2,
    title: "3. Track your status",
    body: "You receive a reference number such as OOTI-2026-00001. Use it on the application status page at any time.",
  },
  {
    icon: GraduationCap,
    title: "4. Report and begin training",
    body: "Once your application is accepted, the institute will contact you with reporting and fee details.",
  },
];

function Admissions() {
  return (
    <>
      <PageHeader
        eyebrow="Admissions"
        title="Join OOTI"
        description="Applications are open online. The process is simple, and you can track it from anywhere."
      >
        <Button asChild variant="gold">
          <Link to="/apply">Start your application</Link>
        </Button>
        <Button asChild variant="onNavy">
          <Link to="/application-status">Check status</Link>
        </Button>
      </PageHeader>

      <section className="section-y">
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <article
              key={step.title}
              className="rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <step.icon className="size-6 text-gold" aria-hidden="true" />
              <h2 className="mt-4 font-display text-base font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-surface section-y">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-8 shadow-card">
            <h2 className="font-display text-xl font-bold">What you will need</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Your full name as it appears on your official documents</li>
              <li>• A phone number the institute can reach you on</li>
              <li>• Your national ID number, where you have one</li>
              <li>• Your highest qualification and mean grade, where applicable</li>
              <li>• Guardian contact details for applicants under 18</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Entry requirements differ by course. Each course page lists its own minimum grade and
              entry requirement where the institute has published them.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-8 shadow-card">
            <h2 className="font-display text-xl font-bold">Need help applying?</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Visit the institute at {INSTITUTION.location}, call {INSTITUTION.phone}, or message us
              on WhatsApp and a member of staff will guide you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="gold">
                <a
                  href={whatsappLink("Hello OOTI, I need help with my application.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp us
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Contact page</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
