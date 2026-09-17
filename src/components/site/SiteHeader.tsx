import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X, Phone, LogOut } from "lucide-react";

import logo from "@/assets/ooti-logo.asset.json";
import { INSTITUTION, NAV_LINKS } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { session } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const signOut = async () => {
    setOpen(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };

  const adminButton = (size: "sm" | "default") =>
    session ? (
      <Button asChild variant="navy" size={size}>
        <Link to="/admin" onClick={() => setOpen(false)}>
          Admin Portal
        </Link>
      </Button>
    ) : (
      <Button asChild variant="navy" size={size}>
        <Link to="/login" onClick={() => setOpen(false)}>
          Admin Login
        </Link>
      </Button>
    );

  const portalButton = (size: "sm" | "default") =>
    session ? (
      <>
        <Button asChild variant="outline" size={size}>
          <Link to="/portal" onClick={() => setOpen(false)}>
            My Portal
          </Link>
        </Button>
        <Button variant="ghost" size={size} onClick={signOut} aria-label="Sign out">
          <LogOut className="size-4" /> Sign out
        </Button>
      </>
    ) : (
      <Button asChild variant="outline" size={size}>
        <Link to="/login" onClick={() => setOpen(false)}>
          Student Portal
        </Link>
      </Button>
    );

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
          {portalButton("sm")}
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
            <div className="mt-2 flex flex-wrap gap-2 [&>*]:flex-1">
              {portalButton("default")}
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
