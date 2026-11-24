import { Link } from "@tanstack/react-router";
import { ChevronRight, LogOut, UserCircle } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useStore } from "@/lib/mock-store";

export function AccountDrawer() {
  const { currentUser, logout } = useStore();
  const [open, setOpen] = useState(false);
  const items = [
    { label: "My profile", to: "/profile" },
    { label: "Browse properties", to: "/buy" },
    { label: "List a property", to: "/list-property" },
    { label: "Help and contact", to: "/contact" },
  ] as const;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className="pv-button-secondary gap-2 px-3 sm:px-4"
        >
          <UserCircle className="h-5 w-5" aria-hidden="true" />
          <span className="hidden max-w-24 truncate sm:inline">
            {currentUser ? "Account" : "Sign in"}
          </span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(90vw,24rem)] overflow-y-auto bg-card p-6">
        <div className="mt-6 border-b border-border pb-6">
          <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-smoke text-navy">
            <UserCircle className="h-6 w-6" />
          </span>
          <SheetTitle className="break-words text-xl font-semibold">
            {currentUser ? currentUser.name : "Welcome to Braj Setu"}
          </SheetTitle>
          <SheetDescription className="mt-2 break-words">
            {currentUser
              ? currentUser.email
              : "Sign in to manage your profile and submit a property."}
          </SheetDescription>
          {!currentUser && (
            <div className="mt-5 grid gap-3">
              <Link to="/login" onClick={() => setOpen(false)} className="pv-button-primary">
                Sign in
              </Link>
              <Link to="/register" onClick={() => setOpen(false)} className="pv-button-secondary">
                Create an account
              </Link>
            </div>
          )}
        </div>
        <nav aria-label="Account navigation" className="mt-4 grid gap-1">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center justify-between gap-3 rounded-lg px-3 text-sm font-medium hover:bg-smoke"
            >
              {item.label}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </nav>
        <p className="mt-6 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
          By using this website, you agree to our{" "}
          <Link to="/terms" onClick={() => setOpen(false)} className="underline">
            terms
          </Link>
          . Read our{" "}
          <Link to="/privacy" onClick={() => setOpen(false)} className="underline">
            privacy policy
          </Link>{" "}
          to learn how we use your information.
        </p>
        {currentUser && (
          <button
            type="button"
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="pv-button-secondary mt-6 w-full gap-2"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        )}
      </SheetContent>
    </Sheet>
  );
}
