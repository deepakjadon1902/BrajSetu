import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeIndianRupee,
  Check,
  FileCheck2,
  Home,
  ImagePlus,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useStore } from "@/lib/mock-store";
import { cn } from "@/lib/utils";
import type { Property, PropertyCategory, PropertyIntent } from "@/types/property";

export const Route = createFileRoute("/list-property")({
  head: () => ({
    meta: [
      { title: "List Your Property | Braj Setu Properties" },
      {
        name: "description",
        content:
          "Submit a verified flat, house, plot, shop or farm house listing to Braj Setu Properties for admin review.",
      },
      { property: "og:title", content: "List Your Property | Braj Setu Properties" },
      {
        property: "og:description",
        content:
          "Owners can submit property details after accepting listing terms and verification rules.",
      },
    ],
  }),
  component: ListPropertyPage,
});

const categories: PropertyCategory[] = ["Flat", "House", "Plot", "Shop", "Farm House"];
const intents: PropertyIntent[] = ["Sale", "Rent"];
const cities = [
  "Vrindavan",
  "Mathura",
  "Govardhan",
  "Barsana",
  "Gokul",
  "Nandgaon",
  "Baldev",
  "Raya",
  "Kosi Kalan",
];
const localities = [
  "Chhatikara",
  "Raman Reti",
  "Sunrakh Road",
  "Radha Kund Road",
  "Holi Gate",
  "Yamuna Kinara",
  "Prem Mandir Road",
  "Parikrama Marg",
  "NH-19",
  "Banke Bihari Mandir",
  "ISKCON Road",
  "Barsana Road",
];
const furnishingOptions = ["Unfurnished", "Semi-furnished", "Furnished", "Bare shell"];
const amenityOptions = [
  "Garden",
  "Parking",
  "Temple nearby",
  "Market nearby",
  "Wide road",
  "Power backup",
  "Water supply",
  "Security",
  "Storage",
  "Lift",
  "Boundary wall",
];

const fieldClass =
  "mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none transition-colors placeholder:text-muted-foreground focus:border-navy";
const labelClass = "text-xs font-semibold uppercase tracking-wide text-navy-soft";

type Draft = Omit<
  Property,
  | "id"
  | "featured"
  | "status"
  | "listingSource"
  | "reviewStatus"
  | "submittedBy"
  | "termsAcceptedAt"
> & {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  termsAccepted: boolean;
};

const initialDraft: Draft = {
  title: "",
  category: "Flat",
  intent: "Sale",
  price: 0,
  location: { city: "Vrindavan", locality: "Chhatikara" },
  specs: { area: 0, bedrooms: 0, bathrooms: 0, furnishing: "Semi-furnished" },
  images: [],
  amenities: ["Parking", "Temple nearby"],
  description: "",
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
  termsAccepted: false,
};

function ListPropertyPage() {
  const { currentUser, submitProperty } = useStore();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Draft>(() => ({
    ...initialDraft,
    ownerName: currentUser?.name ?? "",
    ownerEmail: currentUser?.email ?? "",
    ownerPhone: currentUser?.phone ?? "",
  }));
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => validateDraft(draft), [draft]);
  const canSubmit = currentUser && draft.termsAccepted && errors.length === 0 && !submitting;

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function addImage() {
    const trimmed = imageUrl.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      toast.error("Enter a valid image URL.");
      return;
    }
    if (draft.images.length >= 8) {
      toast.error("You can add up to 8 image URLs.");
      return;
    }
    setDraft((current) => ({ ...current, images: [...current.images, trimmed] }));
    setImageUrl("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!currentUser) {
      toast.error("Please sign in before listing a property.");
      return;
    }
    if (!draft.termsAccepted) {
      toast.error("Accept the listing terms before submitting.");
      return;
    }
    if (errors.length) {
      toast.error(errors[0]);
      return;
    }

    setSubmitting(true);
    try {
      await submitProperty(draft);
      toast.success("Property submitted for admin review.");
      navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Property could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-smoke pb-20">
      <div className="pv-container grid gap-8 pt-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section>
          <p className="text-sm font-bold text-gold-deep">Owner listing desk</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            List your property for admin review
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Submit accurate property details, owner contact information and optional image URLs.
            Braj Setu Properties reviews user listings before publishing them in public search.
          </p>
        </section>

        <aside className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-ice text-navy">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-navy">Review workflow</p>
              <p className="text-xs text-muted-foreground">Valid listings go to admin first.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
            {["Submit verified details", "Accept listing terms", "Admin checks and publishes"].map(
              (item) => (
                <p key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold-deep" />
                  {item}
                </p>
              ),
            )}
          </div>
        </aside>
      </div>

      <form
        onSubmit={onSubmit}
        className="pv-container mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
      >
        <div className="space-y-6 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          {!currentUser ? (
            <div className="rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm text-navy">
              Please{" "}
              <Link to="/login" className="font-bold underline decoration-gold underline-offset-4">
                sign in
              </Link>{" "}
              or create an account before submitting a property.
            </div>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={labelClass}>Listing title</span>
              <input
                value={draft.title}
                onChange={(event) => set("title", event.target.value)}
                placeholder="2 BHK flat near Prem Mandir"
                className={fieldClass}
                minLength={8}
                maxLength={120}
                required
              />
            </label>

            <ChoiceGroup
              label="Listing purpose"
              value={draft.intent}
              options={intents}
              onChange={(intent) => set("intent", intent)}
            />

            <label className="block">
              <span className={labelClass}>Property type</span>
              <select
                value={draft.category}
                onChange={(event) => set("category", event.target.value as PropertyCategory)}
                className={fieldClass}
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={labelClass}>City</span>
              <select
                value={draft.location.city}
                onChange={(event) =>
                  set("location", { ...draft.location, city: event.target.value })
                }
                className={fieldClass}
              >
                {cities.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={labelClass}>Locality</span>
              <select
                value={draft.location.locality}
                onChange={(event) =>
                  set("location", { ...draft.location, locality: event.target.value })
                }
                className={fieldClass}
              >
                {localities.map((locality) => (
                  <option key={locality}>{locality}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={labelClass}>Expected price</span>
              <div className="relative">
                <BadgeIndianRupee className="absolute top-[calc(50%+0.25rem)] left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={draft.price || ""}
                  onChange={(event) => set("price", Number(event.target.value))}
                  type="number"
                  min={1}
                  className={`${fieldClass} pl-11`}
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className={labelClass}>Area in sq.ft</span>
              <input
                value={draft.specs.area || ""}
                onChange={(event) =>
                  set("specs", { ...draft.specs, area: Number(event.target.value) })
                }
                type="number"
                min={1}
                className={fieldClass}
                required
              />
            </label>

            <label className="block">
              <span className={labelClass}>Bedrooms</span>
              <input
                value={draft.specs.bedrooms ?? 0}
                onChange={(event) =>
                  set("specs", { ...draft.specs, bedrooms: Number(event.target.value) })
                }
                type="number"
                min={0}
                max={50}
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Bathrooms</span>
              <input
                value={draft.specs.bathrooms ?? 0}
                onChange={(event) =>
                  set("specs", { ...draft.specs, bathrooms: Number(event.target.value) })
                }
                type="number"
                min={0}
                max={50}
                className={fieldClass}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className={labelClass}>Furnishing</span>
              <select
                value={draft.specs.furnishing}
                onChange={(event) =>
                  set("specs", { ...draft.specs, furnishing: event.target.value })
                }
                className={fieldClass}
              >
                {furnishingOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </section>

          <section>
            <span className={labelClass}>Amenities</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {amenityOptions.map((amenity) => {
                const active = draft.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() =>
                      set(
                        "amenities",
                        active
                          ? draft.amenities.filter((item) => item !== amenity)
                          : [...draft.amenities, amenity],
                      )
                    }
                    className={cn(
                      "pv-smooth-state inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold",
                      active
                        ? "border-navy bg-navy text-background"
                        : "border-border bg-background text-navy-soft hover:border-navy/40",
                    )}
                  >
                    {active ? <Check className="h-3.5 w-3.5" /> : null}
                    {amenity}
                  </button>
                );
              })}
            </div>
          </section>

          <label className="block">
            <span className={labelClass}>Property description</span>
            <textarea
              value={draft.description}
              onChange={(event) => set("description", event.target.value)}
              placeholder="Mention ownership status, road access, nearby landmark, parking, water, power and current availability."
              className={`${fieldClass} min-h-32`}
              minLength={40}
              maxLength={2500}
              required
            />
          </label>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-gold-deep" />
              <h2 className="text-base font-extrabold text-navy">Owner details</h2>
            </div>
            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className={labelClass}>Owner name</span>
                <input
                  value={draft.ownerName}
                  onChange={(event) => set("ownerName", event.target.value)}
                  className={fieldClass}
                  required
                />
              </label>
              <label className="block">
                <span className={labelClass}>Owner email</span>
                <input
                  value={draft.ownerEmail}
                  onChange={(event) => set("ownerEmail", event.target.value)}
                  type="email"
                  className={fieldClass}
                  required
                />
              </label>
              <label className="block">
                <span className={labelClass}>Owner phone</span>
                <input
                  value={draft.ownerPhone}
                  onChange={(event) => set("ownerPhone", event.target.value)}
                  className={fieldClass}
                  minLength={8}
                  required
                />
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2">
              <ImagePlus className="h-4 w-4 text-gold-deep" />
              <h2 className="text-base font-extrabold text-navy">Image URLs</h2>
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://..."
                className="min-w-0 flex-1 rounded-full border border-border px-4 py-2.5 text-sm outline-none focus:border-navy"
              />
              <button
                type="button"
                onClick={addImage}
                className="rounded-full bg-navy px-4 text-sm font-bold text-background"
              >
                Add
              </button>
            </div>
            <div className="mt-3 grid gap-2">
              {draft.images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() =>
                    set(
                      "images",
                      draft.images.filter((_, imageIndex) => imageIndex !== index),
                    )
                  }
                  className="truncate rounded-full border border-border px-3 py-2 text-left text-xs text-muted-foreground hover:border-destructive hover:text-destructive"
                >
                  {String(image)}
                </button>
              ))}
              {!draft.images.length ? (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Images are optional at submission. Admin can add verified photos before
                  publishing.
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <label className="flex items-start gap-3 text-sm leading-relaxed text-navy">
              <input
                type="checkbox"
                checked={draft.termsAccepted}
                onChange={(event) => set("termsAccepted", event.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-[var(--navy)]"
                required
              />
              <span>
                I confirm this property information is accurate, I am authorized to list it, and I
                accept the{" "}
                <Link
                  to="/terms"
                  className="font-bold underline decoration-gold underline-offset-4"
                >
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="font-bold underline decoration-gold underline-offset-4"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            {errors.length ? (
              <div className="mt-4 rounded-2xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                {errors[0]}
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-ice p-3 text-xs font-semibold text-navy">
                <FileCheck2 className="h-4 w-4" />
                Ready for review after terms are accepted.
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="pv-smooth-state mt-4 w-full rounded-full bg-navy px-6 py-3 text-sm font-bold text-background shadow-[var(--shadow-soft)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit property"}
            </button>
          </section>
        </aside>
      </form>
    </div>
  );
}

function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-ice p-1.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "pv-smooth-state rounded-full px-3 py-2.5 text-sm font-bold",
              value === option
                ? "bg-navy text-background shadow-[var(--shadow-soft)]"
                : "text-navy-soft",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function validateDraft(draft: Draft) {
  const errors: string[] = [];
  if (draft.title.trim().length < 8) errors.push("Use a clearer listing title.");
  if (!categories.includes(draft.category)) errors.push("Select a valid property type.");
  if (!intents.includes(draft.intent)) errors.push("Select sale or rent.");
  if (!cities.includes(draft.location.city)) errors.push("Select a valid city.");
  if (!localities.includes(draft.location.locality)) errors.push("Select a valid locality.");
  if (!Number.isFinite(draft.price) || draft.price < 1) errors.push("Enter a valid price.");
  if (!Number.isFinite(draft.specs.area) || draft.specs.area < 1)
    errors.push("Enter a valid area.");
  if ((draft.description ?? "").trim().length < 40)
    errors.push("Add at least 40 characters in the property description.");
  if (draft.ownerName.trim().length < 2) errors.push("Enter the owner name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.ownerEmail))
    errors.push("Enter a valid owner email.");
  if (draft.ownerPhone.trim().length < 8) errors.push("Enter a valid owner phone number.");
  if (draft.images.some((image) => !isUrl(String(image))))
    errors.push("Every image must be a valid URL.");
  return errors;
}

function isUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
