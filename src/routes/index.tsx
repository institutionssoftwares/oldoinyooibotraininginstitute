import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  Laptop,
  MapPin,
  MessageCircle,
  Newspaper,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { INSTITUTION, whatsappLink } from "@/lib/site";
import { coursesQuery, departmentsQuery, eventsQuery, newsQuery } from "@/lib/queries";
import heroImage from "@/assets/campus-entrance.asset.json";
import classroomImage from "@/assets/campus-classroom.asset.json";
import electricalImage from "@/assets/electrical-workshop.asset.json";
import cosmetologyImage from "@/assets/cosmetology.asset.json";
import studentsWalkImage from "@/assets/students-walk.asset.json";
import staffImage from "@/assets/staff-meeting.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OOTI Loitokitok | Technical, Vocational & Digital Skills Training" },
      {
        name: "description",
        content:
          "Oldoinyo Oibor Training Institute, Loitokitok: plumbing, cosmetology, electrical, ICT and digital skills courses. Apply online today.",
      },
      { property: "og:title", content: "Oldoinyo Oibor Training Institute (OOTI) Loitokitok" },
      {
        property: "og:description",
        content:
          "Empowering skills. Creating opportunities. Transforming lives. Apply for NITA and CDACC accredited training.",
      },
    ],
  }),
  component: Home,
});

const WHY = [
  {
    icon: Wrench,
    title: "Hands-on training",
    text: "Practical workshop-based learning in plumbing, electrical, cosmetology and computing.",
  },
  {
    icon: Award,
    title: "Recognised assessment",
    text: "Courses prepared for NITA and CDACC assessment across artisan grades and levels.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Employability focus",
    text: "Demand-driven training aimed at the labour market, self-employment and entrepreneurship.",
  },
  {
    icon: Laptop,
    title: "Digital skills",
    text: "Digital literacy, freelancing and modern workplace skills alongside every trade.",
  },
];

function Home() {
  const departments = useQuery(departmentsQuery);
  const courses = useQuery(coursesQuery);
  const news = useQuery(newsQuery);
  const events = useQuery(eventsQuery);

  const featuredCourses = (courses.data ?? [])
    .filter((c) => c.category !== "Digital Skills")
    .slice(0, 6);
  const digitalCourses = (courses.data ?? [])
    .filter((c) => c.category === "Digital Skills")
    .slice(0, 8);
  const latestNews = (news.data ?? []).slice(0, 3);
  const upcomingEvents = (events.data ?? []).slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-navy text-navy-foreground">
        <img
          src={heroImage.url}
          alt="Entrance signage of Oldoinyo Oibor Training Institute in Loitokitok"
          className="absolute inset-0 -z-10 size-full object-cover opacity-25"
        />
        <div className="container-page grid gap-10 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-28">
          <div>
            <p className="eyebrow">{INSTITUTION.name}</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Empowering skills. Creating opportunities. Transforming lives.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed opacity-90">
              Quality technical, vocational and digital skills training designed to equip learners
              with practical competencies for the labour market, entrepreneurship and
              self-employment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="xl">
                <Link to="/apply">Apply now</Link>
              </Button>
              <Button asChild variant="onNavy" size="xl">
                <Link to="/courses">Explore courses</Link>
              </Button>
              <Button asChild variant="onNavy" size="xl">
                <Link to="/login">Student portal</Link>
              </Button>
              <Button asChild variant="onNavy" size="xl">
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden="true" /> WhatsApp us
                </a>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-navy-foreground/20 pt-6 text-sm">
              <div>
                <dt className="opacity-70">Departments</dt>
                <dd className="font-display text-2xl font-bold text-gold">
                  {departments.data?.length ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="opacity-70">Courses</dt>
                <dd className="font-display text-2xl font-bold text-gold">
                  {courses.data?.length ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="opacity-70">Location</dt>
                <dd className="font-display text-base font-semibold">Loitokitok</dd>
              </div>
            </dl>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
            <img
              src={classroomImage.url}
              alt="Trainer addressing students in an OOTI classroom"
              className="w-full rounded-xl bg-navy/5 object-contain shadow-lift"
              loading="lazy"
            />
            <img
              src={electricalImage.url}
              alt="Trainees wiring a distribution board in the electrical workshop"
              className="w-full rounded-xl bg-navy/5 object-contain shadow-lift sm:mt-8"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="section-y">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
          <img
            src={studentsWalkImage.url}
            alt="OOTI trainees walking together on campus grounds"
            className="w-full rounded-xl bg-navy/5 object-contain shadow-card"
            loading="lazy"
          />
          <div>
            <p className="eyebrow">About OOTI</p>
            <h2 className="mt-2 font-display text-3xl font-bold">
              A training institute built around practical competence
            </h2>
            <p className="mt-4 text-muted-foreground">
              Oldoinyo Oibor Training Institute is a technical and vocational training institution
              based in {INSTITUTION.location}. Training is demand-driven and centred on transformative
              technical skills, digital literacy, innovation and readiness for the labour market.
            </p>
            <p className="mt-4 text-muted-foreground">
              Learners train across building and plumbing, cosmetology, electrical engineering,
              computing and informatics, and digital skills — preparing for employment,
              entrepreneurship and self-employment.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/about">
                  Learn more <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/admissions">Admissions</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="bg-surface section-y">
        <div className="container-page grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border border-border bg-card p-8 shadow-card">
            <p className="eyebrow">Our mission</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground sm:text-base">
              {INSTITUTION.mission}
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card p-8 shadow-card">
            <p className="eyebrow">Our vision</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground sm:text-base">
              {INSTITUTION.vision}
            </p>
            <p className="mt-6 border-t border-border pt-4 text-sm italic text-muted-foreground">
              Motto: {INSTITUTION.motto}
            </p>
          </article>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="section-y">
        <div className="container-page">
          <p className="eyebrow">Why choose OOTI</p>
          <h2 className="mt-2 font-display text-3xl font-bold">Training that leads to work</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-border bg-card p-6 shadow-card"
              >
                <item.icon className="size-6 text-gold" aria-hidden="true" />
                <h3 className="mt-4 font-display text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* DEPARTMENTS */}
      <section className="bg-surface section-y">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Departments</p>
              <h2 className="mt-2 font-display text-3xl font-bold">Where you can train</h2>
            </div>
            <Button asChild variant="outline">
              <Link to="/departments">All departments</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(departments.data ?? []).map((dept) => (
              <Link
                key={dept.id}
                to="/departments/$slug"
                params={{ slug: dept.slug }}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-lift"
              >
                <GraduationCap className="size-6 text-gold" aria-hidden="true" />
                <h3 className="mt-4 font-display text-lg font-semibold group-hover:text-primary">
                  {dept.name}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {dept.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="section-y">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Courses</p>
              <h2 className="mt-2 font-display text-3xl font-bold">Popular programmes</h2>
            </div>
            <Button asChild variant="outline">
              <Link to="/courses">View all courses</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <Link
                key={course.id}
                to="/courses/$slug"
                params={{ slug: course.slug }}
                className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-lift"
              >
                <span className="w-fit rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  {course.category}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold group-hover:text-primary">
                  {course.name}
                </h3>
                <dl className="mt-4 space-y-1 text-sm text-muted-foreground">
                  {course.duration ? (
                    <div className="flex justify-between gap-3">
                      <dt>Duration</dt>
                      <dd className="font-medium text-foreground">{course.duration}</dd>
                    </div>
                  ) : null}
                  {course.minimum_grade ? (
                    <div className="flex justify-between gap-3">
                      <dt>Minimum grade</dt>
                      <dd className="font-medium text-foreground">{course.minimum_grade}</dd>
                    </div>
                  ) : null}
                  {course.exam_body ? (
                    <div className="flex justify-between gap-3">
                      <dt>Exam body</dt>
                      <dd className="font-medium text-foreground">{course.exam_body}</dd>
                    </div>
                  ) : null}
                </dl>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DIGITAL SKILLS */}
      <section className="bg-navy text-navy-foreground section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">Digital skills</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Digital skills for the modern world</h2>
            <p className="mt-4 opacity-90">
              Build practical digital skills for employment, freelancing, entrepreneurship and the
              modern workplace.
            </p>
            <Button asChild variant="gold" size="lg" className="mt-6">
              <Link to="/digital-skills">Explore digital skills</Link>
            </Button>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {digitalCourses.map((course) => (
              <li key={course.id}>
                <Link
                  to="/digital-skills/$slug"
                  params={{ slug: course.slug }}
                  className="block rounded-lg border border-navy-foreground/20 px-4 py-3 text-sm font-medium transition-colors hover:border-gold hover:text-gold"
                >
                  {course.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ADMISSIONS */}
      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">Admissions</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Apply in a few minutes</h2>
            <ol className="mt-6 space-y-4">
              {[
                "Choose the course you want to train in.",
                "Complete the online application form.",
                "Receive your application reference number.",
                "Track your application status online.",
              ].map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold font-display text-sm font-bold text-gold-foreground">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-sm text-muted-foreground">{step}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link to="/apply">Start application</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/application-status">Check status</Link>
              </Button>
            </div>
          </div>
          <img
            src={cosmetologyImage.url}
            alt="Braiding and styling work completed by OOTI cosmetology trainees"
            className="w-full rounded-xl bg-navy/5 object-contain shadow-card"
            loading="lazy"
          />
        </div>
      </section>

      {/* NEWS & EVENTS */}
      <section className="bg-surface section-y">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-bold">Latest news</h2>
              <Link to="/news" className="text-sm font-medium text-primary hover:underline">
                All news
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {latestNews.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                  <Newspaper className="mb-2 size-5" aria-hidden="true" />
                  News published by the institute will appear here.
                </p>
              ) : (
                latestNews.map((post) => (
                  <Link
                    key={post.id}
                    to="/news/$slug"
                    params={{ slug: post.slug }}
                    className="block rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-lift"
                  >
                    <h3 className="font-display text-base font-semibold">{post.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-bold">Upcoming events</h2>
              <Link to="/events" className="text-sm font-medium text-primary hover:underline">
                All events
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                  <CalendarDays className="mb-2 size-5" aria-hidden="true" />
                  Events published by the institute will appear here.
                </p>
              ) : (
                upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    to="/events/$slug"
                    params={{ slug: event.slug }}
                    className="block rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-lift"
                  >
                    <h3 className="font-display text-base font-semibold">{event.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.starts_at
                        ? new Date(event.starts_at).toLocaleDateString("en-KE", {
                            dateStyle: "medium",
                          })
                        : "Date to be confirmed"}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-y">
        <div className="container-page">
          <div className="grid gap-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card lg:grid-cols-2">
            <img
              src={staffImage.url}
              alt="OOTI staff reviewing training records together"
              className="h-full w-full bg-navy/5 object-contain"
              loading="lazy"
            />
            <div className="p-8 lg:p-12">
              <h2 className="font-display text-3xl font-bold">Ready to start training?</h2>
              <p className="mt-3 text-muted-foreground">
                Talk to the admissions office, visit the campus in Loitokitok, or apply online right
                now.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="gold" size="lg">
                  <Link to="/apply">Apply now</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/contact">Contact us</Link>
                </Button>
              </div>
              <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 text-gold" aria-hidden="true" /> {INSTITUTION.location}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
