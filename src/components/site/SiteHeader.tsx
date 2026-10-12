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
        <Link to="/admin-login" onClick={() => setOpen(false)}>
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

      <div className="container-page grid min-h-18 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2">
        <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          <img
            src={logo.url}
            alt="Oldoinyo Oibor Training Institute crest"
            className="size-12 shrink-0 object-contain"
            width={48}
            height={48}
          />
          <span className="min-w-0 leading-tight">
            <span className="block font-display text-sm font-bold uppercase text-foreground sm:text-base">
              Oldoinyo Oibor
            </span>
            <span className="block text-[11px] uppercase text-muted-foreground">
              Training Institute
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            {adminButton("sm")}
            {portalButton("sm")}
          </div>
          <Button asChild variant="gold" size="sm" className="hidden shrink-0 sm:inline-flex">
            <Link to="/apply">Apply Now</Link>
          </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 xl:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
        </div>
      </div>

      <nav aria-label="Main" className="container-page hidden flex-wrap items-center gap-1 border-t border-border/70 py-1 xl:flex">
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
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {adminButton("default")}
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
