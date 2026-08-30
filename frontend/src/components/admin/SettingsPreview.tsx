import { Facebook, Instagram, Linkedin, X } from "lucide-react";

import type { SiteSettings } from "@/lib/mock-store";

/** Live, non-interactive preview of the public chrome for the admin settings page. */
export function SettingsPreview({ settings }: { settings: SiteSettings }) {
  const socials = [
    { href: settings.socialInstagram, Icon: Instagram, label: "Instagram" },
    { href: settings.socialFacebook, Icon: Facebook, label: "Facebook" },
    { href: settings.socialLinkedin, Icon: Linkedin, label: "LinkedIn" },
    { href: settings.socialX, Icon: X, label: "X" },
  ].filter((s) => s.href.trim().length > 0);

  return (
    <section className="rounded-3xl border border-border bg-background p-6">
      <h2 className="text-base font-bold text-navy">Live preview</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        How the public site will look with your unsaved changes.
      </p>

      <div className="mt-5 overflow-hidden rounded-2xl border border-border">
        {settings.announcementEnabled && settings.announcementMessage ? (
          <div
            className={
              settings.announcementTone === "gold"
                ? "bg-gold px-4 py-2 text-center text-xs font-medium text-primary-foreground"
                : "bg-navy px-4 py-2 text-center text-xs font-medium text-background"
            }
          >
            {settings.announcementMessage}
          </div>
        ) : null}

        <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy text-xs font-extrabold text-background">
            {settings.logoInitials || "BS"}
          </span>
          <span className="truncate text-sm font-extrabold text-navy">
            {settings.siteName || "Site name"}
          </span>
          <span className="ml-auto hidden gap-3 text-xs text-navy-soft/80 sm:flex">
            <span>Buy</span>
            <span>Rent</span>
            <span>Sale</span>
          </span>
          <span className="rounded-full bg-navy px-3 py-1.5 text-[11px] font-semibold text-background">
            Contact Us
          </span>
        </div>

        <div className="bg-smoke px-4 py-8 text-center text-xs text-muted-foreground">
          Page content
        </div>

        <div className="bg-navy px-4 py-5 text-background/80">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-background text-xs font-extrabold text-navy">
              {settings.logoInitials || "BS"}
            </span>
            <span className="text-sm font-extrabold text-background">
              {settings.siteName || "Site name"}
            </span>
          </div>
          <p className="mt-3 line-clamp-3 text-xs leading-relaxed">{settings.tagline}</p>
          <div className="mt-3 flex gap-2">
            {socials.map(({ Icon, label }) => (
              <span
                key={label}
                className="grid h-8 w-8 place-items-center rounded-full border border-background/20"
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-background/60">
            {settings.contactPhone} · {settings.contactEmail}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border p-4">
        <p className="text-xs font-semibold tracking-wide text-navy uppercase">Social share card</p>
        {settings.ogImage ? (
          <img
            src={settings.ogImage}
            alt="Open Graph preview"
            className="mt-3 h-36 w-full rounded-xl object-cover"
          />
        ) : (
          <div className="mt-3 grid h-24 w-full place-items-center rounded-xl bg-smoke text-xs text-muted-foreground">
            No OG image set
          </div>
        )}
        <p className="mt-3 text-sm font-semibold text-navy">
          {settings.ogTitle || settings.metaTitle}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {settings.ogDescription || settings.metaDescription}
        </p>
      </div>
    </section>
  );
}
