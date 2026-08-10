import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { useStore } from "@/lib/mock-store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/properties", label: "Properties", icon: Building2, exact: false },
  { to: "/admin/users", label: "Users", icon: Users, exact: false },
  { to: "/admin/enquiries", label: "Enquiries", icon: Mail, exact: false },
  { to: "/admin/news", label: "News", icon: Newspaper, exact: false },
] as const;

export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { adminUser, adminLogout, hydrated } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (hydrated && !adminUser) navigate({ to: "/admin/login", replace: true });
  }, [hydrated, adminUser, navigate]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!hydrated || !adminUser) {
    return (
      <div className="grid min-h-screen place-items-center bg-navy text-sm text-background/70">
        Checking your admin session…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-smoke">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold text-sm font-extrabold text-navy">
              PV
            </span>
            <span className="text-sm font-bold tracking-tight text-background">
              Admin Console
            </span>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="text-background/70 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.to
              : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-background/10 text-background"
                    : "text-background/60 hover:bg-background/5 hover:text-background",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-background/10 p-4">
          <p className="truncate text-xs text-background/50">{adminUser.email}</p>
          <button
            type="button"
            onClick={() => {
              adminLogout();
              navigate({ to: "/admin/login", replace: true });
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-background/20 px-4 py-2 text-xs font-semibold text-background transition-colors hover:bg-background/10"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-navy/50 lg:hidden"
        />
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="text-navy lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <a
            href="/"
            className="ml-auto rounded-full border border-border px-4 py-2 text-xs font-semibold text-navy"
          >
            View site
          </a>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
            {actions}
          </div>
          <div className="mt-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
