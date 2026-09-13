import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Building2,
  CalendarDays,
  FileText,
  HelpCircle,
  Home,
  Images,
  LayoutDashboard,
  Megaphone,
  Newspaper,
  Quote,
  Settings,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { RESOURCES, can, type Permissions } from "@/lib/admin/resources";

const ICONS: Record<string, typeof Newspaper> = {
  news: Newspaper,
  events: CalendarDays,
  announcements: Megaphone,
  albums: Images,
  courses: BookOpen,
  departments: Building2,
  staff: Users,
  documents: FileText,
  faqs: HelpCircle,
  testimonials: Quote,
  stories: Trophy,
};

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

export function AdminLayout({ permissions }: { permissions: Permissions }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="container-page flex flex-col gap-6 py-8 lg:flex-row">
      <aside className="lg:w-60 lg:shrink-0">
        <div className="rounded-xl border border-border bg-card p-3 lg:sticky lg:top-24">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Admin portal
          </p>
          <nav className="flex flex-col gap-4">
            {GROUPS.map((group) => {
              const items = group.items.filter(
                (i) => !i.perm || can(permissions, i.perm),
              );
              if (!items.length) return null;
              return (
                <div key={group.label}>
                  <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                    {group.label}
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    {items.map((item) => {
                      const active =
                        item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
                      return (
                        <li key={item.to}>
                          <Link
                            to={item.to}
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
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export function resourceTitle(key: string) {
  return RESOURCES[key]?.plural ?? key;
}

export { Sparkles };
