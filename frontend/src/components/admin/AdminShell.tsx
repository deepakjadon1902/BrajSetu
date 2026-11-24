import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  History,
  Newspaper,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { permissionLabels, roleLabels, useStore, type AdminPermission } from "@/lib/mock-store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard" },
  { to: "/admin/properties", label: "Properties", icon: Building2, permission: "properties" },
  { to: "/admin/users", label: "Users", icon: Users, permission: "users" },
  { to: "/admin/enquiries", label: "Enquiries", icon: Mail, permission: "enquiries" },
  { to: "/admin/news", label: "News", icon: Newspaper, permission: "news" },
  { to: "/admin/settings", label: "Settings", icon: Settings, permission: "settings" },
  { to: "/admin/activity", label: "Activity", icon: History, permission: "activity" },
] as const;

export function AdminShell({
  title,
  description,
  actions,
  permission,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  permission?: AdminPermission;
  children: ReactNode;
}) {
  const { adminUser, adminLogout, sessionHydrated, can } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => {
    if (sessionHydrated && !adminUser) void navigate({ to: "/admin/login", replace: true });
  }, [sessionHydrated, adminUser, navigate]);
  if (!sessionHydrated || !adminUser)
    return (
      <div className="grid min-h-screen place-items-center bg-smoke">
        <p role="status" className="text-sm text-muted-foreground">
          Checking your admin session…
        </p>
      </div>
    );

  const allowed = !permission || can(permission);
  const navigation = (
    <div className="flex h-full flex-col bg-navy text-white">
      <Link
        to="/admin"
        onClick={() => setOpen(false)}
        className="flex h-[72px] items-center gap-3 border-b border-white/10 px-5"
      >
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-gold text-xs font-semibold text-navy">
          BS
        </span>
        <span className="text-sm font-semibold">Braj Setu Console</span>
      </Link>
      <nav aria-label="Admin navigation" className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav
          .filter((item) => can(item.permission))
          .map((item) => {
            const active =
              item.to === "/admin" ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/65 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
      </nav>
      <div className="border-t border-white/10 p-5">
        <p className="break-all text-xs text-white/65">{adminUser.email}</p>
        <p className="mt-2 text-xs text-white/65">{roleLabels[adminUser.role]}</p>
        <button
          type="button"
          onClick={() => {
            adminLogout();
            void navigate({ to: "/admin/login", replace: true });
          }}
          className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/20 text-sm font-medium hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-smoke">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 lg:block">{navigation}</aside>
      <div className="min-w-0 lg:pl-60">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur-md sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open admin navigation"
                className="pv-icon-button lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 border-0 bg-navy p-0 [&>button]:text-white">
              <SheetTitle className="sr-only">Admin navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Manage properties, accounts and settings.
              </SheetDescription>
              {navigation}
            </SheetContent>
          </Sheet>
          <p className="hidden text-sm text-muted-foreground lg:block">Administration</p>
          <Link to="/" className="pv-button-secondary ml-auto px-4">
            View website
          </Link>
        </header>
        <main className="admin-content min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-navy sm:text-3xl">{title}</h1>
              {description && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {actions}
          </div>
          <div className="mt-6">
            {allowed ? (
              children
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 text-center sm:p-10">
                <Lock className="mx-auto h-6 w-6 text-gold-deep" />
                <h2 className="mt-4 text-lg font-semibold text-navy">
                  You do not have access to this area.
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                  Your role ({roleLabels[adminUser.role]}) does not include{" "}
                  {permission ? permissionLabels[permission] : "the required permission"}. Ask an
                  administrator for help.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
