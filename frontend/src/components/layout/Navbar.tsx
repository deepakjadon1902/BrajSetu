import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Menu, Plus } from "lucide-react";
import { useState } from "react";
import { AccountDrawer } from "@/components/AccountDrawer";
import { BrandLogo } from "@/components/BrandLogo";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { label: "Buy", to: "/buy" },
  { label: "Rent", to: "/rent" },
  { label: "Sell", to: "/sale" },
  { label: "About us", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <nav
        aria-label="Main navigation"
        className="pv-container flex h-16 items-center justify-between gap-3 lg:grid lg:h-[72px] lg:grid-cols-[1fr_auto_1fr]"
      >
        <Link to="/" aria-label="Braj Setu Properties home" className="shrink-0">
          <BrandLogo compact />
        </Link>
        <div className="hidden items-center gap-1 rounded-full border border-border bg-card p-1 lg:flex">
          {links.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              aria-current={pathname === to ? "page" : undefined}
              className={cn(
                "pv-smooth-state pv-tap inline-flex items-center rounded-full px-4 text-sm font-medium",
                pathname === to
                  ? "bg-navy text-white"
                  : "text-muted-foreground hover:bg-smoke hover:text-navy",
              )}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1.5 lg:justify-self-end lg:gap-2">
          <Link to="/list-property" className="pv-button-primary hidden gap-2 sm:inline-flex">
            <Plus className="h-4 w-4" aria-hidden="true" /> List property
          </Link>
          <AccountDrawer />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open navigation"
                className="pv-icon-button border border-border bg-card lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(88vw,22rem)] overflow-y-auto bg-background p-6"
            >
              <SheetTitle className="mt-3 text-lg font-semibold text-navy">
                Explore Braj Setu
              </SheetTitle>
              <SheetDescription>Find a property or get in touch with our team.</SheetDescription>
              <nav aria-label="Mobile navigation" className="mt-8 grid gap-2">
                {links.map(({ label, to }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    aria-current={pathname === to ? "page" : undefined}
                    className={cn(
                      "pv-smooth-state flex min-h-12 items-center justify-between gap-2 rounded-xl px-4 text-base font-medium",
                      pathname === to ? "bg-navy text-white" : "bg-card text-navy hover:bg-ice",
                    )}
                  >
                    {label}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                ))}
                <Link
                  to="/list-property"
                  onClick={() => setOpen(false)}
                  className="pv-button-primary mt-4 gap-2"
                >
                  <Plus className="h-4 w-4" /> List your property
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
