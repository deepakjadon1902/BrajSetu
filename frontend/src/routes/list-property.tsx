import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BadgeIndianRupee, Check, FileCheck2, Home, MapPin, ShieldCheck } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { BrajLocationFields } from "@/components/BrajLocationFields";
import { PropertyPhotoEditor } from "@/components/PropertyPhotoEditor";
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
          "Submit a flat, house, plot, shop or farm house to Braj Setu Properties for review.",
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
const furnishingOptions = ["Unfurnished", "Semi-furnished", "Furnished", "Bare shell"];
const areaUnits: NonNullable<NonNullable<Property["propertyDetails"]>["areaUnit"]>[] = [
  "sq.ft",
  "sq.m",
  "sq.yd",
  "acre",
  "bigha",
];
const ownerRoles: NonNullable<NonNullable<Property["ownerDetails"]>["ownerRole"]>[] = [
  "Owner",
  "Landlord",
  "Developer",
  "Authorized Partner",
  "Broker",
];
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
  "mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-navy outline-none transition-colors placeholder:text-muted-foreground focus:border-navy";
const requiredSelectClass = `${fieldClass} invalid:text-muted-foreground [&>option]:text-navy`;
const labelClass = "text-xs font-semibold uppercase tracking-wide text-navy-soft";
const requiredLabelClass = `${labelClass} after:ml-1 after:text-destructive after:content-['*']`;

type Draft = Omit<
  Property,
  | "id"
  | "category"
  | "specs"
  | "featured"
  | "status"
  | "listingSource"
  | "reviewStatus"
  | "submittedBy"
  | "termsAcceptedAt"
> & {
  category: PropertyCategory | "";
  specs: Omit<Property["specs"], "area"> & { area: string };
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerRole: NonNullable<NonNullable<Property["ownerDetails"]>["ownerRole"]>;
  organizationName: string;
  ownerAddress: string;
  authorityType: string;
  propertyDetails: NonNullable<Property["propertyDetails"]>;
  termsAccepted: boolean;
  loanOrEncumbrance: string;
  litigationOrDispute: string;
  reraNumber: string;
};

const initialDraft: Draft = {
  title: "",
  category: "",
  intent: "Sale",
  price: 0,
  location: { city: "", locality: "" },
  specs: { area: "", bedrooms: 0, bathrooms: 0, furnishing: "Semi-furnished" },
  images: [],
  amenities: ["Parking", "Temple nearby"],
  description: "",
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
  ownerRole: "Owner",
  organizationName: "",
  ownerAddress: "",
  authorityType: "",
  propertyDetails: {
    availability: "Available now",
    parking: "",
    leaseType: "",
    priceNegotiable: false,
    gatedCommunity: false,
    gasPipeline: false,
  },
  termsAccepted: false,
  loanOrEncumbrance: "",
  litigationOrDispute: "",
  reraNumber: "",
};

function ListPropertyPage() {
  const { currentUser, submitProperty, uploadPropertyImages } = useStore();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Draft>(() => ({
    ...initialDraft,
    ownerName: currentUser?.name ?? "",
    ownerEmail: currentUser?.email ?? "",
    ownerPhone: currentUser?.phone ?? "",
  }));
  const [preparingPhotos, setPreparingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => validateDraft(draft), [draft]);
  const canSubmit =
    currentUser && draft.termsAccepted && errors.length === 0 && !submitting && !preparingPhotos;
  const areaUnit = draft.propertyDetails.areaUnit;

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting || preparingPhotos) return;
    if (!currentUser) {
      toast.error("Please sign in before listing a property.");
      return;
    }
    if (!draft.termsAccepted) {
      toast.error("Accept the listing terms before submitting.");
      return;
    }
    const { category } = draft;
    if (errors.length || !category) {
      toast.error(errors[0] ?? "Select a property type.");
      return;
    }

    setSubmitting(true);
    try {
      await submitProperty({
        ...draft,
        category,
        specs: { ...draft.specs, area: Number(draft.specs.area) },
      });
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
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            List your property
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Submit your property details, owner contact information and optional photos. Braj Setu
            Properties reviews user listings before publishing them in public search.
          </p>
        </section>

        <aside className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-ice text-navy">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-navy">Review workflow</p>
              <p className="text-xs text-muted-foreground">Valid listings go to admin first.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
            {["Share accurate details", "Accept listing terms", "Admin checks and publishes"].map(
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
        <div className="space-y-6 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          {!currentUser ? (
            <div className="rounded-lg border border-gold/40 bg-gold/10 p-4 text-sm text-navy">
              Please{" "}
              <Link to="/login" className="font-bold underline decoration-gold underline-offset-4">
                sign in
              </Link>{" "}
              or create an account before submitting a property.
            </div>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={requiredLabelClass}>Listing title</span>
              <input
                value={draft.title}
                onChange={(event) => set("title", event.target.value)}
                placeholder="e.g. 2 BHK flat near Prem Mandir"
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
              <span className={requiredLabelClass}>Property type</span>
              <select
                value={draft.category}
                onChange={(event) => set("category", event.target.value as PropertyCategory)}
                className={requiredSelectClass}
                required
              >
                <option value="" disabled>
                  Select a property type
                </option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>

            <BrajLocationFields
              location={draft.location}
              onChange={(location) => set("location", location)}
              inputClassName={fieldClass}
              labelClassName={requiredLabelClass}
            />

            <label className="block">
              <span className={requiredLabelClass}>Landmark</span>
              <input
                value={draft.propertyDetails.landmark ?? ""}
                onChange={(event) =>
                  set("propertyDetails", {
                    ...draft.propertyDetails,
                    landmark: event.target.value,
                  })
                }
                className={fieldClass}
                placeholder="e.g. Near Prem Mandir"
                maxLength={160}
                required
              />
            </label>

            <label className="block">
              <span className={requiredLabelClass}>
                {draft.intent === "Rent" ? "Monthly rent (₹)" : "Expected price (₹)"}
              </span>
              <div className="relative">
                <BadgeIndianRupee className="absolute top-[calc(50%+0.25rem)] left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={draft.price || ""}
                  onChange={(event) => set("price", Number(event.target.value))}
                  type="number"
                  min={1}
                  placeholder={draft.intent === "Rent" ? "e.g. 15000" : "e.g. 4500000"}
                  className={`${fieldClass} pl-11`}
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className={requiredLabelClass}>Area unit</span>
              <select
                value={areaUnit ?? ""}
                onChange={(event) =>
                  set("propertyDetails", {
                    ...draft.propertyDetails,
                    areaUnit: event.target.value as (typeof areaUnits)[number],
                  })
                }
                className={requiredSelectClass}
                required
              >
                <option value="" disabled>
                  Select an area unit
                </option>
                {areaUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={requiredLabelClass}>
                Property area{areaUnit ? ` (${areaUnit})` : ""}
              </span>
              <input
                value={draft.specs.area}
                onChange={(event) => set("specs", { ...draft.specs, area: event.target.value })}
                type="number"
                min={0}
                max={10000000}
                step="any"
                placeholder={areaUnit === "sq.ft" ? "e.g. 1200" : "Enter the property area"}
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

            <label className="block sm:col-span-2">
              <span className={requiredLabelClass}>Full property address</span>
              <textarea
                value={draft.propertyDetails.fullAddress ?? ""}
                onChange={(event) =>
                  set("propertyDetails", {
                    ...draft.propertyDetails,
                    fullAddress: event.target.value,
                  })
                }
                placeholder="House/unit number, street, society/colony, locality, city and PIN"
                className={`${fieldClass} min-h-24`}
                maxLength={300}
                required
              />
            </label>
            <details className="border-t border-border pt-4 sm:col-span-2">
              <summary className="pv-tap py-3 text-sm font-semibold text-navy">
                Additional property details (optional)
              </summary>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["fans", "Fans"],
                    ["lights", "Lights"],
                    ["wardrobes", "Wardrobes"],
                    ["acs", "AC units"],
                    ["beds", "Beds"],
                    ["geysers", "Geysers"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block">
                    <span className={labelClass}>{label}</span>
                    <input
                      value={Number(draft.propertyDetails[key] ?? "") || ""}
                      onChange={(event) =>
                        set("propertyDetails", {
                          ...draft.propertyDetails,
                          [key]: event.target.value === "" ? undefined : Number(event.target.value),
                        })
                      }
                      type="number"
                      min={0}
                      max={500}
                      className={fieldClass}
                    />
                  </label>
                ))}

                <label className="block sm:col-span-2">
                  <span className={labelClass}>RERA number, if applicable</span>
                  <input
                    value={draft.reraNumber}
                    onChange={(event) => set("reraNumber", event.target.value)}
                    placeholder="Owner-provided RERA number"
                    className={fieldClass}
                    maxLength={80}
                  />
                </label>

                {(
                  [
                    ["plotArea", "Plot area"],
                    ["carpetArea", "Carpet area"],
                    ["builtUpArea", "Built-up area"],
                    ["balconies", "Balconies"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block">
                    <span className={labelClass}>{label}</span>
                    <input
                      value={Number(draft.propertyDetails[key] ?? "") || ""}
                      onChange={(event) =>
                        set("propertyDetails", {
                          ...draft.propertyDetails,
                          [key]: Number(event.target.value),
                        })
                      }
                      type="number"
                      min={0}
                      className={fieldClass}
                    />
                  </label>
                ))}

                {(
                  [
                    ["floor", "Floor"],
                    ["totalFloors", "Total floors"],
                    ["parking", "Parking"],
                    ["availability", "Availability"],
                    ["facing", "Facing"],
                    ["roadWidth", "Road width"],
                    ["leaseType", "Lease / ownership type"],
                    ["waterSupply", "Water supply"],
                    ["powerBackup", "Power backup"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block">
                    <span className={labelClass}>{label}</span>
                    <input
                      value={String(draft.propertyDetails[key] ?? "")}
                      onChange={(event) =>
                        set("propertyDetails", {
                          ...draft.propertyDetails,
                          [key]: event.target.value,
                        })
                      }
                      className={fieldClass}
                    />
                  </label>
                ))}

                {(
                  [
                    ["priceNegotiable", "Price negotiable"],
                    ["gatedCommunity", "Gated community"],
                    ["gasPipeline", "Gas pipeline"],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-start gap-3 text-sm font-semibold text-navy"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(draft.propertyDetails[key])}
                      onChange={(event) =>
                        set("propertyDetails", {
                          ...draft.propertyDetails,
                          [key]: event.target.checked,
                        })
                      }
                      className="mt-1 h-5 w-5 accent-[var(--navy)]"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </details>
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
                      "pv-smooth-state pv-tap inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold",
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
            <span className={labelClass}>Special highlights shown publicly</span>
            <textarea
              value={(draft.propertyDetails.highlights ?? []).join("\n")}
              onChange={(event) =>
                set("propertyDetails", {
                  ...draft.propertyDetails,
                  highlights: event.target.value
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean),
                })
              }
              placeholder="One real highlight per line, e.g. Corner plot, 30 ft road, Registered society"
              className={`${fieldClass} min-h-28`}
              maxLength={1200}
            />
          </label>

          <section className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Loan / encumbrance declaration</span>
              <textarea
                value={draft.loanOrEncumbrance}
                onChange={(event) => set("loanOrEncumbrance", event.target.value)}
                placeholder="Disclose any loan, mortgage or encumbrance known to you."
                className={`${fieldClass} min-h-24`}
                maxLength={500}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Litigation / dispute declaration</span>
              <textarea
                value={draft.litigationOrDispute}
                onChange={(event) => set("litigationOrDispute", event.target.value)}
                placeholder="Disclose any dispute, litigation or objection known to you."
                className={`${fieldClass} min-h-24`}
                maxLength={500}
              />
            </label>
          </section>

          <label className="block">
            <span className={requiredLabelClass}>Property description</span>
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
          <PropertyPhotoEditor
            images={draft.images}
            onChange={(images) => set("images", images)}
            prepareFiles={(files) => uploadPropertyImages(files, "owner")}
            onPreparingChange={setPreparingPhotos}
            disabled={submitting}
            maxPhotos={8}
          />

          <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-gold-deep" />
              <h2 className="text-base font-semibold text-navy">Owner details</h2>
            </div>
            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className={requiredLabelClass}>Owner name</span>
                <input
                  value={draft.ownerName}
                  onChange={(event) => set("ownerName", event.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className={fieldClass}
                  required
                />
              </label>
              <label className="block">
                <span className={requiredLabelClass}>Owner email</span>
                <input
                  value={draft.ownerEmail}
                  onChange={(event) => set("ownerEmail", event.target.value)}
                  type="email"
                  placeholder="e.g. owner@example.com"
                  className={fieldClass}
                  required
                />
              </label>
              <label className="block">
                <span className={requiredLabelClass}>Owner phone</span>
                <input
                  value={draft.ownerPhone}
                  onChange={(event) => set("ownerPhone", event.target.value)}
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  className={fieldClass}
                  minLength={8}
                  required
                />
              </label>
              <label className="block">
                <span className={labelClass}>Owner / landlord role</span>
                <select
                  value={draft.ownerRole}
                  onChange={(event) =>
                    set(
                      "ownerRole",
                      event.target.value as NonNullable<
                        NonNullable<Property["ownerDetails"]>["ownerRole"]
                      >,
                    )
                  }
                  className={fieldClass}
                >
                  {ownerRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Organization / developer</span>
                <input
                  value={draft.organizationName}
                  onChange={(event) => set("organizationName", event.target.value)}
                  className={fieldClass}
                  maxLength={160}
                />
              </label>
              <label className="block">
                <span className={requiredLabelClass}>Authority to list</span>
                <input
                  value={draft.authorityType}
                  onChange={(event) => set("authorityType", event.target.value)}
                  placeholder="Direct owner, landlord, POA, developer mandate..."
                  className={fieldClass}
                  maxLength={160}
                  required
                />
              </label>
              <label className="block">
                <span className={labelClass}>Owner / landlord address</span>
                <textarea
                  value={draft.ownerAddress}
                  onChange={(event) => set("ownerAddress", event.target.value)}
                  className={`${fieldClass} min-h-24`}
                  maxLength={300}
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <label className="flex items-start gap-3 text-sm leading-relaxed text-navy">
              <input
                type="checkbox"
                checked={draft.termsAccepted}
                onChange={(event) => set("termsAccepted", event.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-[var(--navy)]"
                required
              />
              <span>
                I/we declare that the information provided to Braj Setu Properties is true to my
                knowledge, that I have ownership or valid authority to list this property/project
                for sale/rent/lease/marketing, that I will not knowingly upload content violating
                third-party rights, and that Braj Setu Properties may suspend/remove the listing if
                information is false, misleading, unauthorized or disputed. I understand that a
                listing or verification badge is not an absolute ownership/title legal guarantee. I
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
              <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                {errors[0]}
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-ice p-3 text-xs font-semibold text-navy">
                <FileCheck2 className="h-4 w-4" />
                Ready for review after terms are accepted.
              </div>
            )}

            <button type="submit" disabled={!canSubmit} className="pv-button-primary mt-4 w-full">
              {submitting
                ? "Submitting…"
                : preparingPhotos
                  ? "Preparing photos…"
                  : "Submit property"}
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
      <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-ice p-1.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={value === option}
            className={cn(
              "pv-smooth-state pv-tap rounded-lg px-3 py-2.5 text-sm font-semibold",
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
  if (!draft.category || !categories.includes(draft.category))
    errors.push("Select a valid property type.");
  if (!intents.includes(draft.intent)) errors.push("Select sale or rent.");
  if (draft.location.city.trim().length < 2) errors.push("Enter a main city or town.");
  if (draft.location.locality.trim().length < 2) errors.push("Enter a locality or village.");
  if (!draft.propertyDetails.landmark?.trim()) errors.push("Enter a nearby landmark.");
  if (!Number.isFinite(draft.price) || draft.price < 1) errors.push("Enter a valid price.");
  if (!draft.propertyDetails.areaUnit || !areaUnits.includes(draft.propertyDetails.areaUnit))
    errors.push("Select an area unit.");
  const area = Number(draft.specs.area);
  if (!Number.isFinite(area) || area <= 0 || area > 10000000) errors.push("Enter a valid area.");
  if ((draft.propertyDetails.fullAddress ?? "").trim().length < 8)
    errors.push("Enter the full property address.");
  if ((draft.description ?? "").trim().length < 40)
    errors.push("Add at least 40 characters in the property description.");
  if (draft.ownerName.trim().length < 2) errors.push("Enter the owner name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.ownerEmail))
    errors.push("Enter a valid owner email.");
  if (draft.ownerPhone.trim().length < 8) errors.push("Enter a valid owner phone number.");
  if (draft.authorityType.trim().length < 2)
    errors.push("Enter your authority to list this property.");
  return errors;
}
