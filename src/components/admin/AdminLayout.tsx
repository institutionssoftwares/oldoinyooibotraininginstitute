import { useState } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Building2,
  CalendarDays,
  ExternalLink,
  FileText,
  HelpCircle,
  Home,
  Images,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Newspaper,
  Quote,
  Settings,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";

import logo from "@/assets/ooti-logo.asset.json";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { RESOURCES, can, type Permissions } from "@/lib/admin/resources";
import { SITE_URL } from "@/lib/site";

type NavItem = { to: string; label: string; icon: typeof Newspaper; perm?: Parameters<typeof can>[1] };

const GROUPS: { label: string; items: NavItem[] }[] = [
  { label: "Overview", items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    label: "Website content",
    items: [
      { to: "/admin/news", label: "News", icon: Newspaper, perm: "content" },
      { to: "/admin/events", label: "Events", icon: CalendarDays, perm: "content" },
      { to: "/admin/announcements", label: "Announcements", icon: Megaphone, perm: "content" },
      { to: "/admin/albums", label: "Gallery albums", icon: Images, perm: "content" },
      { to: "/admin/media", label: "Media library", icon: Images, perm: "content" },
      { to: "/admin/testimonials", label: "Testimonials", icon: Quote, perm: "content" },
      { to: "/admin/stories", label: "Success stories", icon: Trophy, perm: "content" },
      { to: "/admin/faqs", label: "FAQs", icon: HelpCircle, perm: "content" },
      { to: "/admin/documents", label: "Documents", icon: FileText, perm: "content" },
      { to: "/admin/homepage", label: "Homepage sections", icon: Home, perm: "content" },
    ],
  },
  {
    label: "Academics",
    items: [
      { to: "/admin/courses", label: "Courses", icon: BookOpen, perm: "academics" },
      { to: "/admin/departments", label: "Departments", icon: Building2, perm: "academics" },
      { to: "/admin/staff", label: "Staff directory", icon: Users, perm: "academics" },
    ],
  },
  {
    label: "System",
    items: [{ to: "/admin/settings", label: "Settings & roles", icon: Settings, perm: "admin" }],
  },
];

/** Standalone admin workspace: own top bar, sidebar and footer (no public site chrome). */
export function AdminLayout({ permissions }: { permissions: Permissions }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    void navigate({ to: "/login", replace: true });
  };

  const nav = (
    <nav className="flex flex-col gap-5">
      {GROUPS.map((group) => {
        const items = group.items.filter((i) => !i.perm || can(permissions, i.perm));
        if (!items.length) return null;
        return (
          <div key={group.label}>
            <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => {
                const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                        active && "bg-primary/10 text-primary",
                      )}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-40 border-b border-border bg-navy text-navy-foreground">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <button
            type="button"
            className="rounded-md p-1.5 hover:bg-navy-foreground/10 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Link to="/admin" className="flex items-center gap-2.5">
            <img src={logo.url} alt="" className="size-8 rounded-full bg-white object-contain" width={32} height={32} />
            <span className="font-display text-sm font-semibold leading-tight">
              OOTI Admin Portal
              <span className="block text-[11px] font-normal opacity-75">Content management system</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1.5">
            <Button asChild size="sm" variant="gold">
              <a href={SITE_URL} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                <span className="hidden sm:inline">View website</span>
              </a>
            </Button>
            <Button size="sm" variant="ghost" className="text-navy-foreground hover:bg-navy-foreground/10 hover:text-navy-foreground" onClick={signOut}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={cn(
            "fixed inset-y-14 left-0 z-30 w-64 shrink-0 overflow-y-auto border-r border-border bg-card p-3 transition-transform lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {nav}
        </aside>
        {open ? <button type="button" aria-label="Close menu" className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setOpen(false)} /> : null}
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      <footer className="border-t border-border bg-card px-4 py-3 text-xs text-muted-foreground lg:px-8">
        Changes publish instantly to{" "}
        <a href={SITE_URL} className="font-medium text-primary hover:underline" target="_blank" rel="noreferrer">
          oldoinyooibortraininginstitute.co.ke
        </a>
        . Portal built by{" "}
        <a href="https://euspansolutions.co.ke" className="font-medium text-primary hover:underline" target="_blank" rel="noreferrer">
          Euspan Solutions
        </a>{" "}
        · 0769 722 940
      </footer>
    </div>
  );
}

export function resourceTitle(key: string) {
  return RESOURCES[key]?.label ?? key;
}

export { Sparkles };
