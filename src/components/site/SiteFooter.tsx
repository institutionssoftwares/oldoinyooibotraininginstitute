import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

import logo from "@/assets/ooti-logo.asset.json";
import { INSTITUTION } from "@/lib/site";

const quickLinks = [
  { label: "About OOTI", to: "/about" },
  { label: "Courses", to: "/courses" },
  { label: "Departments", to: "/departments" },
  { label: "Digital Skills", to: "/digital-skills" },
  { label: "Admissions", to: "/admissions" },
  { label: "Apply Online", to: "/apply" },
] as const;

const serviceLinks = [
  { label: "Application Status", to: "/application-status" },
  { label: "Verify Certificate", to: "/verify-certificate" },
  { label: "Downloads", to: "/downloads" },
  { label: "Staff", to: "/staff" },
  { label: "Student Success", to: "/student-success" },
  { label: "FAQ", to: "/faq" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-navy text-navy-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={logo.url}
              alt="OOTI crest"
              className="size-14 object-contain"
              width={56}
              height={56}
              loading="lazy"
            />
            <span className="font-display text-sm font-semibold uppercase tracking-wide">
              Oldoinyo Oibor
              <span className="block text-xs font-normal opacity-80">Training Institute</span>
            </span>
          </div>
          <p className="mt-4 text-sm opacity-85">{INSTITUTION.motto}</p>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-gold">
            Quick links
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {quickLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="opacity-85 hover:text-gold hover:opacity-100">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-gold">
            Services
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {serviceLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="opacity-85 hover:text-gold hover:opacity-100">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-gold">
            Contact
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2 opacity-85">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              {INSTITUTION.location}
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              <a href={`tel:${INSTITUTION.phone}`} className="opacity-85 hover:opacity-100">
                {INSTITUTION.phone}
              </a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              <a href={`mailto:${INSTITUTION.email}`} className="break-all opacity-85 hover:opacity-100">
                {INSTITUTION.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-foreground/15">
        <div className="container-page flex flex-col gap-2 py-5 text-xs opacity-75 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {INSTITUTION.name}, Loitokitok. All rights reserved.
          </p>
          <p>
            Proudly designed, developed &amp; powered by{" "}
            <a
              href="https://euspansolutions.co.ke"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gold hover:underline"
            >
              Euspan Solutions
            </a>{" "}
            — Emmanuel Ndunda, Developer/CEO
          </p>
        </div>
      </div>
    </footer>
  );
}
