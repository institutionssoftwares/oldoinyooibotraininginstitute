import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Phone } from "lucide-react";

import logo from "@/assets/ooti-logo.asset.json";
import { INSTITUTION, NAV_LINKS } from "@/lib/site";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="hidden bg-navy text-navy-foreground md:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <p className="opacity-90">{INSTITUTION.location}</p>
          <div className="flex items-center gap-5">
            <a className="inline-flex items-center gap-1.5 hover:underline" href={`tel:${INSTITUTION.phone}`}>
              <Phone className="size-3.5" aria-hidden="true" /> {INSTITUTION.phone}
            </a>
            <a className="hover:underline" href={`mailto:${INSTITUTION.email}`}>
              {INSTITUTION.email}
            </a>
          </div>
        </div>
      </div>

      <div className="container-page flex h-18 items-center justify-between gap-4 py-2">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img
            src={logo.url}
            alt="Oldoinyo Oibor Training Institute crest"
            className="size-12 shrink-0 object-contain"
            width={48}
            height={48}
          />
          <span className="leading-tight">
            <span className="block font-display text-sm font-bold uppercase tracking-wide text-foreground sm:text-base">
              Oldoinyo Oibor
            </span>
            <span className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Training Institute
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 xl:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-foreground bg-secondary" }}
              activeOptions={{ exact: link.to === "/" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Student Portal</Link>
          </Button>
          <Button asChild variant="gold" size="sm">
            <Link to="/apply">Apply Now</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-md border border-border xl:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background xl:hidden">
          <nav aria-label="Mobile" className="container-page grid gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button asChild variant="outline">
                <Link to="/login" onClick={() => setOpen(false)}>
                  Student Portal
                </Link>
              </Button>
              <Button asChild variant="gold">
                <Link to="/apply" onClick={() => setOpen(false)}>
                  Apply Now
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
