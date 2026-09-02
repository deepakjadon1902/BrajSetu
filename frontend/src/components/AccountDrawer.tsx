import { Link } from "@tanstack/react-router";
import { ChevronRight, LogOut, Menu, Phone, UserCircle } from "lucide-react";
import { useState } from "react";

import { BrandLogo } from "@/components/BrandLogo";
import { SmartImage } from "@/components/SmartImage";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useStore } from "@/lib/mock-store";

function firstImage(images: unknown[]): string {
  const image = images[0];
  if (typeof image === "string") return image;
  if (image && typeof image === "object" && "src" in image) return String(image.src);
  return "/braj-setu-logo.jpeg";
}

const activityItems = [
  { label: "Contacted", value: "00" },
  { label: "Seen", value: "00" },
  { label: "Saved", value: "00" },
  { label: "Searches", value: "00" },
];

const guestActivityItems = [
  { label: "Contacted", value: "00" },
  { label: "Seen", value: "00" },
  { label: "Saved", value: "00" },
  { label: "Searches", value: "00" },
];

export function AccountDrawer() {
  const { currentUser, logout, properties, settings } = useStore();
  const [open, setOpen] = useState(false);
  const featured = properties.find((property) => property.featured) ?? properties[0];
  const userInitial = currentUser?.name?.trim().charAt(0).toUpperCase() || "B";
  const menuItems = [
    { label: "My Profile", to: "/profile" as const },
    { label: "Matched Properties", to: "/buy" as const },
    { label: "Saved Properties", to: "/buy" as const },
    { label: "Recent Searches", to: "/rent" as const },
    { label: "Help Center", to: "/contact" as const },
    { label: "Report a Fraud", to: "/contact" as const },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className="pv-smooth-state inline-flex h-11 items-center gap-2 rounded-full bg-background px-3.5 text-sm font-black text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:scale-[1.02]"
        >
          {currentUser ? (
            <span className="grid h-7 w-7 place-items-center rounded-full border border-gold/35 bg-gold/15 text-xs font-black text-gold-deep">
              {userInitial}
            </span>
          ) : (
            <UserCircle className="h-4 w-4" />
          )}
          <span className="hidden max-w-[7rem] truncate md:inline">
            {currentUser ? currentUser.name : "Login"}
          </span>
          <Menu className="h-4 w-4" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[min(100vw,25rem)] overflow-y-auto border-l border-gold/25 bg-[#fffdf8] p-0 text-navy shadow-[0_30px_80px_-30px_rgba(18,35,63,0.45)] sm:max-w-[25rem]"
      >
        <SheetTitle className="sr-only">Account menu</SheetTitle>
        <div className="relative overflow-hidden border-b border-gold/20 bg-[#12233f] px-5 pb-6 pt-8 text-background">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gold" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-gold/35 bg-background">
                {currentUser ? (
                  <span className="text-xl font-black text-navy">{userInitial}</span>
                ) : (
                  <BrandLogo className="[&_img]:h-10" compact />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-black">
                  {currentUser ? currentUser.name : "Welcome to Braj Setu"}
                </p>
                <p className="mt-1 truncate text-xs text-background/75">
                  {currentUser ? currentUser.email : "Unlock saved homes and quick enquiries"}
                </p>
              </div>
            </div>
            {!currentUser ? (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 shrink-0 items-center rounded-full bg-gold px-5 text-sm font-black text-navy"
              >
                Login
              </Link>
            ) : null}
          </div>

          <div className="mt-5 border-t border-background/12 pt-4 text-xs leading-relaxed text-background/82">
            Verified Braj Mandal property advisory with saved homes, visit planning and direct
            contact support.
          </div>
        </div>

        <div className="p-5">
          <section className="rounded-xl border border-gold/20 bg-background p-4 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black">My Activity</h2>
              <span className="rounded-full bg-smoke px-3 py-1 text-[0.7rem] font-black text-navy-soft">
                Account
              </span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {(currentUser ? activityItems : guestActivityItems).map((item) => (
                <div
                  key={item.label}
                  className="grid min-h-18 place-items-center rounded-lg border border-border bg-card px-1 py-2 text-center"
                >
                  <span className="text-base font-black text-navy">{item.value}</span>
                  <span className="text-[0.66rem] font-semibold leading-tight text-navy-soft">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {featured ? (
            <section className="mt-5 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
              <SmartImage
                src={firstImage(featured.images)}
                alt={featured.title}
                aspect="aspect-[16/9]"
                wrapperClassName="bg-smoke"
              />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-black">
                      Rs. {featured.price.toLocaleString("en-IN")}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-navy-soft">
                      {featured.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {featured.location.locality}, {featured.location.city}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[0.65rem] font-black text-gold-deep">
                    Featured
                  </span>
                </div>
                <Link
                  to="/property/$propertyId"
                  params={{ propertyId: featured.id }}
                  onClick={() => setOpen(false)}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-navy text-sm font-black text-background"
                >
                  View property
                </Link>
              </div>
            </section>
          ) : null}

          <section className="mt-5 grid gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className="pv-smooth-state flex min-h-12 items-center gap-3 border-b border-border px-1 text-sm font-bold text-navy last:border-b-0 hover:text-gold-deep"
              >
                <span className="min-w-0 flex-1">{item.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </section>

          <div className="mt-5 rounded-xl border border-gold/25 bg-background p-4">
            <div className="flex items-center gap-3">
              <BrandLogo className="[&_img]:h-11" compact />
              <div>
                <p className="text-sm font-black">List your property</p>
                <p className="text-xs text-muted-foreground">Sell or rent with verified leads.</p>
              </div>
            </div>
            <Link
              to="/sale"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full border border-gold/35 bg-card text-sm font-black text-navy"
            >
              Post property
            </Link>
          </div>

          <a
            href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-navy text-sm font-black text-background shadow-[0_18px_34px_-24px_rgba(18,35,63,0.65)]"
          >
            <Phone className="h-4 w-4" />
            Contact advisor
          </a>

          {currentUser ? (
            <button
              type="button"
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-black text-navy"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          ) : (
            <div className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
              Sign in to receive shortlist alerts and visit confirmations.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
