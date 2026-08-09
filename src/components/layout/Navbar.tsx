import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/mock-store";

const links = [
  { to: "/buy", label: "Buy" },
  { to: "/rent", label: "Rent" },
  { to: "/sale", label: "Sale" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { currentUser, logout } = useStore();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <nav className="pv-container grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:h-20 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy text-sm font-extrabold text-background">
            PV
          </span>
          <span className="truncate text-lg font-extrabold tracking-tight text-navy">
            PropVista
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                activeProps={{ className: "text-navy font-semibold" }}
                className="rounded-full px-4 py-2 text-sm font-medium text-navy-soft/80 transition-colors hover:text-navy"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-end gap-2">
          {currentUser ? (
            <>
              <span className="hidden max-w-[10rem] truncate text-sm font-medium text-navy sm:inline">
                {currentUser.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-navy-soft transition-colors hover:text-navy sm:inline-flex"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-navy-soft transition-colors hover:text-navy sm:inline-flex"
            >
              Sign in
            </Link>
          )}
          <Link
            to="/contact"
            className="hidden items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-background transition-transform duration-200 hover:scale-[1.02] sm:inline-flex"
          >
            Contact Us
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-full border border-border text-navy lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div
        className={cn(
          "overflow-hidden border-t border-border bg-background transition-[max-height] duration-300 lg:hidden",
          open ? "max-h-96" : "max-h-0",
        )}
      >
        <ul className="pv-container flex flex-col gap-1 py-4">
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                onClick={() => setOpen(false)}
                className="pv-tap flex items-center rounded-xl px-3 text-base font-medium text-navy"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="mt-2 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="pv-tap flex items-center justify-center rounded-full border border-border text-sm font-semibold text-navy"
            >
              Sign in
            </Link>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="pv-tap flex items-center justify-center rounded-full bg-navy text-sm font-semibold text-background"
            >
              Contact Us
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
