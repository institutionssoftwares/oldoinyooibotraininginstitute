import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { INSTITUTION, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/verify-certificate")({
  head: () => ({
    meta: [
      { title: "Verify a Certificate | OOTI Loitokitok" },
      {
        name: "description",
        content:
          "Verify a certificate issued by Oldoinyo Oibor Training Institute, Loitokitok. Confirm the authenticity of a graduate's award with the institute.",
      },
      { property: "og:title", content: "Verify an OOTI Certificate" },
      {
        property: "og:description",
        content: "Confirm the authenticity of a certificate issued by OOTI Loitokitok.",
      },
    ],
  }),
  component: VerifyCertificate,
});

function VerifyCertificate() {
  return (
    <>
      <PageHeader
        eyebrow="Certificate verification"
        title="Verify a certificate"
        description="Employers and institutions can confirm certificates issued by OOTI."
      />
      <section className="section-y">
        <div className="container-page max-w-2xl">
          <div className="rounded-xl border border-border bg-card p-8 shadow-card">
            <ShieldCheck className="size-7 text-gold" aria-hidden="true" />
            <h2 className="mt-4 font-display text-xl font-bold">How verification works</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              The online certificate register is being prepared. In the meantime, certificate
              verification is handled directly by the institute. Send the certificate number, the
              graduate's full name and the course, and the office will confirm the record.
            </p>
            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-medium">{INSTITUTION.phone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{INSTITUTION.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Office</dt>
                <dd className="font-medium">{INSTITUTION.location}</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold">
                <a
                  href={whatsappLink(
                    "Hello OOTI, I would like to verify a certificate. Certificate number: ",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Verify on WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Contact the office</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
