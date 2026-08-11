import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { OgImageUploader } from "@/components/admin/OgImageUploader";
import { SettingsPreview } from "@/components/admin/SettingsPreview";
import { defaultSettings, useStore, type SiteSettings } from "@/lib/mock-store";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings | PropVista Admin" },
      {
        name: "description",
        content:
          "Manage PropVista branding, metadata and site-wide announcements from one place.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Settings | PropVista Admin" },
      { property: "og:description", content: "Manage PropVista site settings." },
    ],
  }),
  component: AdminSettings,
});

const inputClass =
  "w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-navy outline-none focus:border-navy";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-wide text-navy uppercase">
        {label}
      </span>
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </label>
  );
}

function Card({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-background p-6">
      <h2 className="text-base font-bold text-navy">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function AdminSettings() {
  const { settings, saveSettings, resetSettings, hydrated } = useStore();
  const [form, setForm] = useState<SiteSettings>(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.siteName.trim() || !form.metaTitle.trim()) {
      toast.error("Site name and meta title are required.");
      return;
    }
    saveSettings({
      ...form,
      siteName: form.siteName.trim(),
      logoInitials: (form.logoInitials.trim() || form.siteName.trim().slice(0, 2))
        .slice(0, 3)
        .toUpperCase(),
      metaTitle: form.metaTitle.trim(),
    });
    toast.success("Settings saved — the public site is updated.");
  }

  return (
    <AdminShell
      permission="settings"
      title="Settings"
      description="Branding, metadata, contact details and announcements for the public site."
      actions={
        <button
          type="button"
          onClick={() => {
            resetSettings();
            toast.success("Settings restored to defaults.");
          }}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-navy"
        >
          <RotateCcw className="h-4 w-4" /> Reset defaults
        </button>
      }
    >
      {!hydrated ? null : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] xl:items-start">
        <form onSubmit={onSubmit} className="grid gap-6">
          <Card
            title="Brand"
            description="Shown in the navbar, footer and across the public site."
          >
            <Field label="Site name">
              <input
                className={inputClass}
                value={form.siteName}
                onChange={(e) => set("siteName", e.target.value)}
              />
            </Field>
            <Field label="Logo initials" hint="Up to 3 characters shown in the logo mark.">
              <input
                className={inputClass}
                maxLength={3}
                value={form.logoInitials}
                onChange={(e) => set("logoInitials", e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Footer tagline">
                <textarea
                  className={`${inputClass} min-h-24`}
                  value={form.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                />
              </Field>
            </div>
          </Card>

          <Card
            title="SEO metadata"
            description="Applied to the browser tab title and search/social previews."
          >
            <div className="sm:col-span-2">
              <Field label="Meta title" hint={`${form.metaTitle.length} characters — aim for under 60.`}>
                <input
                  className={inputClass}
                  value={form.metaTitle}
                  onChange={(e) => set("metaTitle", e.target.value)}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field
                label="Meta description"
                hint={`${form.metaDescription.length} characters — aim for under 160.`}
              >
                <textarea
                  className={`${inputClass} min-h-24`}
                  value={form.metaDescription}
                  onChange={(e) => set("metaDescription", e.target.value)}
                />
              </Field>
            </div>
          </Card>

          <Card
            title="Social sharing"
            description="Open Graph and Twitter Card details used when your links are shared."
          >
            <div className="sm:col-span-2">
              <Field label="OG title">
                <input
                  className={inputClass}
                  value={form.ogTitle}
                  onChange={(e) => set("ogTitle", e.target.value)}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="OG description">
                <textarea
                  className={`${inputClass} min-h-20`}
                  value={form.ogDescription}
                  onChange={(e) => set("ogDescription", e.target.value)}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field
                label="OG image"
                hint="Uploads are cropped to 1200×630 and used for both Open Graph and Twitter previews."
              >
                <OgImageUploader
                  value={form.ogImage}
                  onChange={(next) => set("ogImage", next)}
                />
              </Field>
            </div>
            <Field label="Twitter card type">
              <select
                className={inputClass}
                value={form.twitterCard}
                onChange={(e) =>
                  set("twitterCard", e.target.value as SiteSettings["twitterCard"])
                }
              >
                <option value="summary_large_image">Large image</option>
                <option value="summary">Summary</option>
              </select>
            </Field>
            <Field label="Twitter / X handle">
              <input
                className={inputClass}
                placeholder="@propvista"
                value={form.twitterHandle}
                onChange={(e) => set("twitterHandle", e.target.value)}
              />
            </Field>
          </Card>

          <Card
            title="Social profiles"
            description="Links shown in the footer and on the contact page."
          >
            <Field label="Facebook URL">
              <input
                className={inputClass}
                value={form.socialFacebook}
                onChange={(e) => set("socialFacebook", e.target.value)}
              />
            </Field>
            <Field label="Instagram URL">
              <input
                className={inputClass}
                value={form.socialInstagram}
                onChange={(e) => set("socialInstagram", e.target.value)}
              />
            </Field>
            <Field label="LinkedIn URL">
              <input
                className={inputClass}
                value={form.socialLinkedin}
                onChange={(e) => set("socialLinkedin", e.target.value)}
              />
            </Field>
            <Field label="X (Twitter) URL">
              <input
                className={inputClass}
                value={form.socialX}
                onChange={(e) => set("socialX", e.target.value)}
              />
            </Field>
          </Card>

          <Card title="Contact details" description="Used in the site footer.">
            <Field label="Contact email">
              <input
                className={inputClass}
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
              />
            </Field>
            <Field label="Contact phone">
              <input
                className={inputClass}
                value={form.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Office address">
                <input
                  className={inputClass}
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </Field>
            </div>
          </Card>

          <Card
            title="Notifications"
            description="A dismissible announcement strip at the top of the public site."
          >
            <Field label="Status">
              <button
                type="button"
                onClick={() => set("announcementEnabled", !form.announcementEnabled)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                  form.announcementEnabled
                    ? "bg-navy text-background"
                    : "border border-border text-navy"
                }`}
              >
                {form.announcementEnabled ? "Enabled" : "Disabled"}
              </button>
            </Field>
            <Field label="Tone">
              <select
                className={inputClass}
                value={form.announcementTone}
                onChange={(e) =>
                  set("announcementTone", e.target.value as SiteSettings["announcementTone"])
                }
              >
                <option value="navy">Navy</option>
                <option value="gold">Gold</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Announcement message">
                <textarea
                  className={`${inputClass} min-h-20`}
                  value={form.announcementMessage}
                  onChange={(e) => set("announcementMessage", e.target.value)}
                />
              </Field>
            </div>
          </Card>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-background"
            >
              <Save className="h-4 w-4" /> Save settings
            </button>
            <button
              type="button"
              onClick={() => setForm(settings)}
              className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-navy"
            >
              Discard changes
            </button>
            <span className="self-center text-xs text-muted-foreground">
              Defaults: {defaultSettings.siteName}
            </span>
          </div>
        </form>
        <div className="xl:sticky xl:top-24">
          <SettingsPreview settings={form} />
        </div>
        </div>
      )}
    </AdminShell>
  );
}
