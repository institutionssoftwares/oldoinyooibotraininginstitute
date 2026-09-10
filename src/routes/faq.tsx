import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqsQuery } from "@/lib/queries";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | OOTI Loitokitok" },
      {
        name: "description",
        content:
          "Answers to common questions about courses, admissions, fees, intakes and certification at Oldoinyo Oibor Training Institute.",
      },
      { property: "og:title", content: "OOTI Frequently Asked Questions" },
      { property: "og:description", content: "Admissions, fees, intakes and certification answers." },
    ],
  }),
  component: Faq,
});

function Faq() {
  const faqs = useQuery(faqsQuery);
  const list = faqs.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="If your question is not answered here, please contact the institute directly."
      />
      <section className="section-y">
        <div className="container-page max-w-3xl">
          {faqs.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              Questions and answers will be published here by the institute.
            </p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {list.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="gold">
              <Link to="/contact">Ask a question</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admissions">Admissions info</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
