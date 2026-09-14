import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { INSTITUTION } from "@/lib/site";
import outreachImage from "@/assets/outreach.asset.json";
import entranceImage from "@/assets/students-entrance.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About OOTI | Oldoinyo Oibor Training Institute, Loitokitok" },
      {
        name: "description",
        content:
          "Learn about Oldoinyo Oibor Training Institute in Loitokitok: our training philosophy, technical and vocational education, digital skills and entrepreneurship focus.",
      },
      { property: "og:title", content: "About Oldoinyo Oibor Training Institute" },
      {
        property: "og:description",
        content:
          "Demand-driven technical, vocational and digital skills training in Loitokitok, Kenya.",
      },
    ],
  }),
  component: About,
});

const SECTIONS = [
  {
    title: "Training philosophy",
    body: "Training at OOTI is practical and competency-based. Learners spend time in workshops and computer laboratories so that what they learn can be applied directly at work or in their own enterprise.",
  },
  {
    title: "Technical & vocational education",
    body: "Programmes are structured for artisan grades and competency-based levels, preparing trainees for assessment by the recognised examination bodies used for each course.",
  },
  {
    title: "Digital skills",
    body: "Digital literacy runs through the institute. Trainees build computing, online work and modern workplace skills alongside their trade.",
  },
  {
    title: "Entrepreneurship",
    body: "Courses are designed with self-employment in mind, so graduates can start and run their own service businesses in their communities.",
  },
  {
    title: "Employability",
    body: "Training is demand-driven and shaped around what employers in the region and beyond are looking for.",
  },
  {
    title: "Self-employment",
    body: "Many graduates work independently in plumbing, electrical installation, beauty and computing services. The institute prepares learners for that path.",
  },
];

function About() {
  return (
    <>
      <PageHeader
        eyebrow="About the institution"
        title="Oldoinyo Oibor Training Institute"
        description={`A technical and vocational training institution in ${INSTITUTION.location}, focused on transformative skills, innovation and labour-market readiness.`}
      >
        <Button asChild variant="gold">
          <Link to="/apply">Apply now</Link>
        </Button>
        <Button asChild variant="onNavy">
          <Link to="/courses">Explore courses</Link>
        </Button>
      </PageHeader>

      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <img
            src={entranceImage.url}
            alt="Trainees standing at the entrance of Oldoinyo Oibor Training Institute"
            className="w-full rounded-xl bg-navy/5 object-contain shadow-card"
            loading="lazy"
          />
          <div>
            <h2 className="font-display text-3xl font-bold">About the institution</h2>
            <p className="mt-4 text-muted-foreground">
              Oldoinyo Oibor Training Institute (OOTI) trains young people and adults in technical,
              vocational and digital skills. The institute emphasises demand-driven training,
              transformative technical skills, employability, self-employment, digital literacy,
              entrepreneurship, information technology, innovation and labour-market readiness.
            </p>
            <p className="mt-4 text-muted-foreground">Motto: {INSTITUTION.motto}</p>
          </div>
        </div>
      </section>

      <section className="bg-surface section-y">
        <div className="container-page grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border border-border bg-card p-8 shadow-card">
            <p className="eyebrow">Mission</p>
            <p className="mt-3 leading-relaxed">{INSTITUTION.mission}</p>
            <Link
              to="/mission"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              Read the mission
            </Link>
          </article>
          <article className="rounded-xl border border-border bg-card p-8 shadow-card">
            <p className="eyebrow">Vision</p>
            <p className="mt-3 leading-relaxed">{INSTITUTION.vision}</p>
            <Link
              to="/vision"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              Read the vision
            </Link>
          </article>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((section) => (
              <article
                key={section.title}
                className="rounded-xl border border-border bg-card p-6 shadow-card"
              >
                <h2 className="font-display text-lg font-semibold">{section.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{section.body}</p>
              </article>
            ))}
          </div>
          <img
            src={outreachImage.url}
            alt="OOTI trainer speaking with secondary school students during an outreach session"
            className="mt-10 w-full rounded-xl bg-navy/5 object-contain shadow-card"
            loading="lazy"
          />
        </div>
      </section>
    </>
  );
}
