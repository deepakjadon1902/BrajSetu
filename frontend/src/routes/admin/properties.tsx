import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeIndianRupee,
  BedDouble,
  Building2,
  Check,
  Home,
  MapPin,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Store,
  Trash2,
} from "lucide-react";
import { useMemo, useRef, useState, type FormEvent, type SetStateAction } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { BrajLocationFields } from "@/components/BrajLocationFields";
import { PropertyPhotoEditor } from "@/components/PropertyPhotoEditor";
import { SmartImage } from "@/components/SmartImage";
import { VerificationBadge } from "@/components/VerificationBadge";
import { formatPrice } from "@/lib/api";
import { listingDraftMessage, useListingDrafts } from "@/lib/listing-drafts";
import { uid, useStore } from "@/lib/mock-store";
import { getMainImage } from "@/lib/property-images";
import { cn } from "@/lib/utils";
import type { Property, PropertyCategory, PropertyIntent } from "@/types/property";

export const Route = createFileRoute("/admin/properties")({
  head: () => ({
    meta: [
      { title: "Properties | Braj Setu Admin" },
      {
        name: "description",
        content: "Create, edit and remove Braj Setu Properties property listings.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Properties | Braj Setu Admin" },
      { property: "og:description", content: "Manage Braj Setu Properties listings." },
    ],
  }),
  component: AdminProperties,
});

const categories: PropertyCategory[] = ["Shop", "Flat", "Plot", "House", "Farm House"];
const statuses: NonNullable<Property["status"]>[] = ["New", "Active", "Price Drop"];
const reviewStatuses: NonNullable<Property["reviewStatus"]>[] = [
  "Pending Review",
  "Approved",
  "Needs Changes",
];
const verificationLevels: NonNullable<NonNullable<Property["verification"]>["level"]>[] = [
  "OWNER_LISTED",
  "IDENTITY_CHECKED",
  "DOCUMENT_CHECKED",
  "VERIFIED_LISTING",
  "RERA_VERIFIED",
];
const reraStatuses: NonNullable<NonNullable<Property["rera"]>["status"]>[] = [
  "NOT_APPLICABLE",
  "OWNER_PROVIDED",
  "CHECK_PENDING",
  "CHECKED",
  "MISMATCH",
  "ISSUE",
];
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
  "Furnished",
  "Boundary wall",
];

const inputClass =
  "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-navy outline-none transition-colors placeholder:text-muted-foreground focus:border-navy";
const requiredSelectClass = `${inputClass} invalid:text-muted-foreground [&>option]:text-navy`;
const labelClass = "text-xs font-semibold uppercase tracking-wide text-navy-soft";
const requiredLabelClass = `${labelClass} after:ml-1 after:text-destructive after:content-['*']`;

type PropertyDraft = Omit<Property, "category" | "specs"> & {
  category: PropertyCategory | "";
  specs: Omit<Property["specs"], "area"> & { area: string };
};

function emptyProperty(): PropertyDraft {
  return {
    id: uid("braj"),
    title: "",
    category: "",
    intent: "Sale",
    price: 0,
    location: { city: "", locality: "" },
    specs: { area: "", bedrooms: 0, bathrooms: 0, furnishing: "Semi-furnished" },
    images: [],
    amenities: ["Temple nearby", "Parking"],
    featured: false,
    listingSource: "Admin",
    propertyDetails: {
      availability: "Available now",
      parking: "",
      leaseType: "Freehold",
    },
    ownerDetails: {
      ownerRole: "Owner",
      authorityType: "Direct owner",
      publicContactRole: "Property owner",
    },
    description: "",
  };
}

function normalizeAdminProperty(property: Property): Property {
  return {
    ...property,
    title: property.title ?? "",
    category: property.category ?? "Flat",
    intent: property.intent ?? "Sale",
    price: property.price ?? 0,
    location: {
      city: property.location?.city ?? "",
      locality: property.location?.locality ?? "",
    },
    specs: {
      area: property.specs?.area ?? 0,
      bedrooms: property.specs?.bedrooms ?? 0,
      bathrooms: property.specs?.bathrooms ?? 0,
      furnishing: property.specs?.furnishing ?? "",
    },
    images: property.images ?? [],
    amenities: property.amenities ?? [],
    status: property.status ?? "Active",
    propertyDetails: property.propertyDetails ?? {},
    ownerDetails: property.ownerDetails ?? {},
    verification: {
      ...property.verification,
      level: property.verification?.level ?? "OWNER_LISTED",
    },
    rera: property.rera ?? {},
    reviewStatus: property.reviewStatus ?? "Approved",
    description: property.description ?? "",
  };
}

function AdminProperties() {
  const { adminUser, can } = useStore();
  const scope = adminUser && can("properties") ? `admin:${adminUser.id}` : null;
  return <AdminPropertyEditor key={scope} scope={scope} />;
}

function AdminPropertyEditor({ scope }: { scope: string | null }) {
  const {
    adminProperties: storedProperties,
    saveProperty,
    deleteProperty,
    uploadPropertyImages,
  } = useStore();
  const [draft, setOpenDraft] = useState<PropertyDraft | null>(null);
  const openDraftRef = useRef<PropertyDraft | null>(null);
  const drafts = useListingDrafts<PropertyDraft>(scope);
  const [search, setSearch] = useState("");
  const [intentFilter, setIntentFilter] = useState<"All" | PropertyIntent>("All");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const adminProperties = useMemo(
    () => storedProperties.map(normalizeAdminProperty),
    [storedProperties],
  );
  const areaUnit = draft?.propertyDetails?.areaUnit;
  const openDraftStatus = drafts.entries.find((entry) => entry.id === draft?.id)?.status;

  function openDraft(next: PropertyDraft | null) {
    openDraftRef.current = next;
    setOpenDraft(next);
  }

  function setDraft(update: SetStateAction<PropertyDraft | null>) {
    const current = openDraftRef.current;
    const next = typeof update === "function" ? update(current) : update;
    if (!next || next === current) return;
    openDraft(next);
    drafts.save(next.id, next);
  }

  const metrics = useMemo(
    () => ({
      all: adminProperties.length,
      sale: adminProperties.filter((property) => property.intent === "Sale").length,
      rent: adminProperties.filter((property) => property.intent === "Rent").length,
      featured: adminProperties.filter((property) => property.featured).length,
      pending: adminProperties.filter((property) => property.reviewStatus === "Pending Review")
        .length,
    }),
    [adminProperties],
  );

  const visible = adminProperties.filter((property) => {
    const matchesSearch =
      `${property.title} ${property.location.city} ${property.location.locality} ${property.category}`
        .toLowerCase()
        .includes(search.trim().toLowerCase());
    return matchesSearch && (intentFilter === "All" || property.intent === intentFilter);
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || saving || uploading) return;
    const requiredFields = event.currentTarget.querySelectorAll<
      HTMLInputElement | HTMLSelectElement
    >("input[required], select[required]");
    for (const field of requiredFields) {
      if (!field.reportValidity()) return;
    }
    const { category } = draft;
    if (!category) return;
    const title = draft.title.trim();
    if (title.length < 2) {
      toast.error("Enter a listing title with at least 2 characters.");
      return;
    }
    const area = Number(draft.specs.area);
    if (area <= 0) {
      toast.error("Enter a positive property area.");
      return;
    }

    setSaving(true);
    try {
      await saveProperty({ ...draft, title, category, specs: { ...draft.specs, area } });
      if (!(await drafts.clear(draft.id))) {
        toast.warning(
          "The listing was saved, but its draft couldn't be removed from this browser.",
        );
      }
      toast.success("Listing saved.");
      openDraft(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Listing could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell
      permission="properties"
      title="Properties"
      description="Build Buy, Rent and Sale listings for Vrindavan, Mathura, Govardhan, Barsana and nearby Braj Mandal areas."
      actions={
        <button
          type="button"
          disabled={drafts.loading || saving || uploading}
          onClick={() => openDraft(emptyProperty())}
          className="pv-smooth-state flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-background shadow-[var(--shadow-soft)] hover:scale-[1.02] disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> New listing
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "All listings", value: metrics.all, icon: Building2 },
          { label: "For buyers", value: metrics.sale, icon: Home },
          { label: "For rent", value: metrics.rent, icon: Store },
          { label: "Pending review", value: metrics.pending, icon: Sparkles },
        ].map((metric) => (
          <div
            key={metric.label}
            className="pv-lift rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-soft)]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-muted-foreground">{metric.label}</span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ice text-navy">
                <metric.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-navy">{metric.value}</p>
          </div>
        ))}
      </div>

      {!draft && (drafts.loading || drafts.unavailable || drafts.entries.length > 0) ? (
        <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <h2 className="text-lg font-semibold text-navy">Listing drafts</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {drafts.loading
              ? "Loading drafts…"
              : listingDraftMessage(undefined, drafts.unavailable)}
          </p>
          {drafts.entries.length > 0 ? (
            <ul className="mt-4 divide-y divide-border border-t border-border">
              {drafts.entries.map((entry) => {
                const title = entry.draft.title.trim() || "Untitled listing";
                return (
                  <li key={entry.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-navy">{title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {entry.status === "saved"
                          ? [entry.draft.category, entry.draft.location.city]
                              .filter(Boolean)
                              .join(" · ") || "New draft"
                          : listingDraftMessage(entry.status)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openDraft(entry.draft)}
                      aria-label={`Resume draft for ${title}`}
                      className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-semibold text-navy hover:bg-ice"
                    >
                      Resume draft
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </section>
      ) : null}

      {draft ? (
        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-lift)]"
        >
          <div className="grid gap-6 border-b border-border p-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div>
              <p className={labelClass}>
                {adminProperties.some((property) => property.id === draft.id)
                  ? "Edit listing"
                  : "New listing"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-navy">
                {draft.title || "Braj Mandal property listing"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Fields marked with an asterisk are required. Set Review status to Approved to
                publish a new listing.
              </p>
            </div>

            <div inert={saving} className="grid grid-cols-2 gap-2 rounded-lg bg-ice p-2">
              {(["Sale", "Rent"] as PropertyIntent[]).map((intent) => (
                <button
                  key={intent}
                  type="button"
                  onClick={() => setDraft({ ...draft, intent })}
                  className={cn(
                    "pv-smooth-state rounded-full px-4 py-2.5 text-sm font-bold",
                    draft.intent === intent
                      ? "bg-navy text-background shadow-[var(--shadow-soft)]"
                      : "text-navy-soft hover:bg-background",
                  )}
                >
                  {intent === "Sale" ? "Buy / Sale" : "Rent"}
                </button>
              ))}
            </div>
          </div>

          <div inert={saving} className="grid gap-6 p-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-6">
              <section className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className={requiredLabelClass}>Listing title</span>
                  <input
                    className={`mt-2 ${inputClass}`}
                    placeholder="e.g. 2 BHK flat near Prem Mandir"
                    required
                    maxLength={120}
                    value={draft.title}
                    onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  />
                </label>

                <label className="block">
                  <span className={requiredLabelClass}>Property type</span>
                  <select
                    className={`mt-2 ${requiredSelectClass}`}
                    required
                    value={draft.category}
                    onChange={(event) =>
                      setDraft({ ...draft, category: event.target.value as PropertyCategory })
                    }
                  >
                    <option value="" disabled>
                      Select a property type
                    </option>
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className={requiredLabelClass}>Status</span>
                  <select
                    className={`mt-2 ${requiredSelectClass}`}
                    required
                    value={draft.status ?? ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        status: event.target.value as NonNullable<Property["status"]>,
                      })
                    }
                  >
                    <option value="" disabled>
                      Select a listing status
                    </option>
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className={requiredLabelClass}>Review status</span>
                  <select
                    className={`mt-2 ${requiredSelectClass}`}
                    required
                    value={draft.reviewStatus ?? ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        reviewStatus: event.target.value as NonNullable<Property["reviewStatus"]>,
                      })
                    }
                  >
                    <option value="" disabled>
                      Select a review status
                    </option>
                    {reviewStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className={requiredLabelClass}>Verification level</span>
                  <select
                    className={`mt-2 ${requiredSelectClass}`}
                    required
                    value={draft.verification?.level ?? ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        verification: {
                          ...draft.verification,
                          level: event.target.value as NonNullable<
                            NonNullable<Property["verification"]>["level"]
                          >,
                        },
                      })
                    }
                  >
                    <option value="" disabled>
                      Select a verification level
                    </option>
                    {verificationLevels.map((level) => (
                      <option key={level} value={level}>
                        {level.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </label>

                <BrajLocationFields
                  location={draft.location}
                  onChange={(location) => setDraft({ ...draft, location })}
                  inputClassName={`mt-2 ${inputClass}`}
                  labelClassName={requiredLabelClass}
                />

                <label className="block">
                  <span className={requiredLabelClass}>Landmark</span>
                  <input
                    className={`mt-2 ${inputClass}`}
                    placeholder="e.g. Near Prem Mandir"
                    required
                    maxLength={160}
                    value={draft.propertyDetails?.landmark ?? ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        propertyDetails: { ...draft.propertyDetails, landmark: event.target.value },
                      })
                    }
                  />
                </label>

                <label className="block">
                  <span className={requiredLabelClass}>
                    {draft.intent === "Rent" ? "Monthly rent (₹)" : "Price (₹)"}
                  </span>
                  <div className="relative mt-2">
                    <BadgeIndianRupee className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      className={`${inputClass} pl-11`}
                      type="number"
                      required
                      min={0}
                      max={10000000000}
                      step="any"
                      placeholder={draft.intent === "Rent" ? "e.g. 15000" : "e.g. 4500000"}
                      value={draft.price || ""}
                      onChange={(event) =>
                        setDraft({ ...draft, price: Number(event.target.value) })
                      }
                    />
                  </div>
                </label>

                <label className="block">
                  <span className={requiredLabelClass}>Area unit</span>
                  <select
                    className={`mt-2 ${requiredSelectClass}`}
                    value={areaUnit ?? ""}
                    required
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        propertyDetails: {
                          ...draft.propertyDetails,
                          areaUnit: event.target.value as (typeof areaUnits)[number],
                        },
                      })
                    }
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
                    className={`mt-2 ${inputClass}`}
                    type="number"
                    required
                    min={0}
                    max={10000000}
                    step="any"
                    placeholder={areaUnit === "sq.ft" ? "e.g. 1200" : "Enter the property area"}
                    value={draft.specs.area}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        specs: { ...draft.specs, area: event.target.value },
                      })
                    }
                  />
                </label>

                <label className="block">
                  <span className={labelClass}>Bedrooms</span>
                  <div className="relative mt-2">
                    <BedDouble className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      className={`${inputClass} pl-11`}
                      type="number"
                      min={0}
                      value={draft.specs.bedrooms ?? ""}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          specs: { ...draft.specs, bedrooms: Number(event.target.value) },
                        })
                      }
                    />
                  </div>
                </label>

                <label className="block">
                  <span className={labelClass}>Bathrooms</span>
                  <input
                    className={`mt-2 ${inputClass}`}
                    type="number"
                    min={0}
                    value={draft.specs.bathrooms ?? ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        specs: { ...draft.specs, bathrooms: Number(event.target.value) },
                      })
                    }
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className={labelClass}>Furnishing</span>
                  <select
                    className={`mt-2 ${inputClass}`}
                    value={draft.specs.furnishing ?? ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        specs: { ...draft.specs, furnishing: event.target.value },
                      })
                    }
                  >
                    <option value="">Select furnishing</option>
                    {furnishingOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>

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
                      className={`mt-2 ${inputClass}`}
                      type="number"
                      min={0}
                      max={500}
                      value={Number(draft.propertyDetails?.[key] ?? "") || ""}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          propertyDetails: {
                            ...draft.propertyDetails,
                            [key]:
                              event.target.value === "" ? undefined : Number(event.target.value),
                          },
                        })
                      }
                    />
                  </label>
                ))}

                <label className="block sm:col-span-2">
                  <span className={labelClass}>Full property address</span>
                  <textarea
                    className={`mt-2 min-h-20 ${inputClass}`}
                    value={draft.propertyDetails?.fullAddress ?? ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        propertyDetails: {
                          ...draft.propertyDetails,
                          fullAddress: event.target.value,
                        },
                      })
                    }
                    placeholder="House/unit number, street, society/colony, locality, city and PIN"
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
                      className={`mt-2 ${inputClass}`}
                      type="number"
                      min={0}
                      value={draft.propertyDetails?.[key] ?? ""}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          propertyDetails: {
                            ...draft.propertyDetails,
                            [key]: Number(event.target.value),
                          },
                        })
                      }
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
                      className={`mt-2 ${inputClass}`}
                      value={String(draft.propertyDetails?.[key] ?? "")}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          propertyDetails: {
                            ...draft.propertyDetails,
                            [key]: event.target.value,
                          },
                        })
                      }
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
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-4 text-sm text-navy"
                  >
                    <span className="font-semibold">{label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(draft.propertyDetails?.[key])}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          propertyDetails: {
                            ...draft.propertyDetails,
                            [key]: event.target.checked,
                          },
                        })
                      }
                      className="h-5 w-5 accent-[var(--navy)]"
                    />
                  </label>
                ))}

                <label className="block">
                  <span className={labelClass}>RERA number</span>
                  <input
                    className={`mt-2 ${inputClass}`}
                    value={draft.rera?.providedNumber ?? ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        rera: { ...draft.rera, providedNumber: event.target.value },
                      })
                    }
                  />
                </label>

                <label className="block">
                  <span className={labelClass}>RERA status</span>
                  <select
                    className={`mt-2 ${inputClass}`}
                    value={draft.rera?.status ?? "NOT_APPLICABLE"}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        rera: {
                          ...draft.rera,
                          status: event.target.value as NonNullable<
                            NonNullable<Property["rera"]>["status"]
                          >,
                        },
                      })
                    }
                  >
                    {reraStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, " ")}
                      </option>
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
                          setDraft({
                            ...draft,
                            amenities: active
                              ? draft.amenities.filter((item) => item !== amenity)
                              : [...draft.amenities, amenity],
                          })
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
                <span className={labelClass}>Special highlights shown publicly</span>
                <textarea
                  className={`mt-2 min-h-28 ${inputClass}`}
                  value={(draft.propertyDetails?.highlights ?? []).join("\n")}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      propertyDetails: {
                        ...draft.propertyDetails,
                        highlights: event.target.value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                  placeholder="One real highlight per line, e.g. Corner plot, 30 ft road, Registered society"
                  maxLength={1200}
                />
              </label>

              <label className="block">
                <span className={labelClass}>Description</span>
                <textarea
                  className={`mt-2 min-h-28 ${inputClass}`}
                  placeholder="Mention road width, nearest temple or market, ownership clarity, parking and buyer or renter fit."
                  maxLength={2500}
                  value={draft.description ?? ""}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                />
              </label>
            </div>

            <aside className="space-y-4">
              <PropertyPhotoEditor
                key={draft.id}
                images={draft.images}
                onChange={(images) =>
                  setDraft((current) =>
                    current?.id === draft.id ? { ...current, images } : current,
                  )
                }
                prepareFiles={(files) => uploadPropertyImages(files, "admin")}
                onPreparingChange={setUploading}
                disabled={saving}
              />

              <section className="rounded-xl border border-border bg-background p-4">
                <h3 className="text-sm font-semibold text-navy">Owner / landlord details</h3>
                <div className="mt-4 grid gap-3">
                  <label className="block">
                    <span className={labelClass}>Owner / landlord name</span>
                    <input
                      className={`mt-2 ${inputClass}`}
                      value={draft.ownerDetails?.ownerName ?? draft.ownerName ?? ""}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          ownerName: event.target.value,
                          ownerDetails: { ...draft.ownerDetails, ownerName: event.target.value },
                        })
                      }
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Role</span>
                    <select
                      className={`mt-2 ${inputClass}`}
                      value={draft.ownerDetails?.ownerRole ?? "Owner"}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          ownerDetails: {
                            ...draft.ownerDetails,
                            ownerRole: event.target.value as NonNullable<
                              NonNullable<Property["ownerDetails"]>["ownerRole"]
                            >,
                          },
                        })
                      }
                    >
                      {ownerRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className={labelClass}>Phone</span>
                    <input
                      className={`mt-2 ${inputClass}`}
                      value={draft.ownerDetails?.ownerPhone ?? draft.ownerPhone ?? ""}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          ownerPhone: event.target.value,
                          ownerDetails: { ...draft.ownerDetails, ownerPhone: event.target.value },
                        })
                      }
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Email</span>
                    <input
                      className={`mt-2 ${inputClass}`}
                      value={draft.ownerDetails?.ownerEmail ?? draft.ownerEmail ?? ""}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          ownerEmail: event.target.value,
                          ownerDetails: { ...draft.ownerDetails, ownerEmail: event.target.value },
                        })
                      }
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Organization / developer</span>
                    <input
                      className={`mt-2 ${inputClass}`}
                      value={draft.ownerDetails?.organizationName ?? ""}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          ownerDetails: {
                            ...draft.ownerDetails,
                            organizationName: event.target.value,
                          },
                        })
                      }
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Authority to list</span>
                    <input
                      className={`mt-2 ${inputClass}`}
                      value={draft.ownerDetails?.authorityType ?? ""}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          ownerDetails: {
                            ...draft.ownerDetails,
                            authorityType: event.target.value,
                          },
                        })
                      }
                      placeholder="Direct owner, landlord, POA, developer mandate..."
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Owner address</span>
                    <textarea
                      className={`mt-2 min-h-20 ${inputClass}`}
                      value={draft.ownerDetails?.ownerAddress ?? ""}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          ownerDetails: {
                            ...draft.ownerDetails,
                            ownerAddress: event.target.value,
                          },
                        })
                      }
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Public contact label</span>
                    <input
                      className={`mt-2 ${inputClass}`}
                      value={draft.ownerDetails?.publicContactName ?? ""}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          ownerDetails: {
                            ...draft.ownerDetails,
                            publicContactName: event.target.value,
                          },
                        })
                      }
                      placeholder="Shown on public detail page, e.g. Braj Setu Advisor"
                    />
                  </label>
                </div>
              </section>

              <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-4 text-sm text-navy">
                <span className="font-semibold">Feature on homepage</span>
                <input
                  type="checkbox"
                  checked={Boolean(draft.featured)}
                  onChange={(event) => setDraft({ ...draft, featured: event.target.checked })}
                  className="h-5 w-5 accent-[var(--navy)]"
                />
              </label>

              {draft.listingSource === "User" ? (
                <div className="rounded-lg border border-gold/25 bg-gold/10 p-4 text-sm text-navy">
                  <p className="font-bold">Submitted by user</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {draft.ownerName || "Owner"} | {draft.ownerEmail || "No email"} |{" "}
                    {draft.ownerPhone || "No phone"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Terms accepted:{" "}
                    {draft.termsAcceptedAt
                      ? new Date(draft.termsAcceptedAt).toLocaleString("en-IN")
                      : "Not recorded"}
                  </p>
                </div>
              ) : null}
            </aside>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-border bg-smoke/70 p-5">
            <button
              type="submit"
              disabled={uploading || saving}
              className="pv-smooth-state rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-background hover:scale-[1.02] disabled:opacity-60"
            >
              {saving ? "Saving listing…" : "Save listing"}
            </button>
            <button
              type="button"
              disabled={saving || uploading}
              onClick={() => openDraft(null)}
              className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-navy"
            >
              Close editor
            </button>
            <p role="status" className="text-sm text-muted-foreground">
              {listingDraftMessage(openDraftStatus, drafts.unavailable)}
            </p>
          </div>
        </form>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
        <div className="grid gap-3 border-b border-border p-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative max-w-xl">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className={`${inputClass} pl-11`}
              placeholder="Search by title, city, locality or type"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="flex rounded-full bg-ice p-1">
            {(["All", "Sale", "Rent"] as const).map((intent) => (
              <button
                key={intent}
                type="button"
                onClick={() => setIntentFilter(intent)}
                className={cn(
                  "pv-smooth-state rounded-full px-4 py-2 text-xs font-bold",
                  intentFilter === intent
                    ? "bg-navy text-background shadow-[var(--shadow-soft)]"
                    : "text-navy-soft hover:bg-background",
                )}
              >
                {intent === "Sale" ? "Buy / Sale" : intent}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border">
          {visible.map((property) => (
            <article
              key={property.id}
              className="pv-smooth-state grid gap-4 p-4 hover:bg-smoke/70 lg:grid-cols-[6.5rem_minmax(0,1fr)_auto]"
            >
              <SmartImage
                src={getMainImage(property)}
                alt={property.title || "Property"}
                aspect="aspect-[4/3]"
                wrapperClassName="rounded-lg"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-base font-semibold text-navy">
                    {property.title || "Untitled"}
                  </h3>
                  <span className="rounded-full bg-ice px-2.5 py-1 text-[11px] font-bold text-navy">
                    {property.category}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold",
                      property.intent === "Sale"
                        ? "bg-gold/20 text-gold-deep"
                        : "bg-navy/10 text-navy",
                    )}
                  >
                    {property.intent === "Sale" ? "Buy / Sale" : "Rent"}
                  </span>
                  {property.featured ? (
                    <span className="rounded-full bg-peacock/10 px-2.5 py-1 text-[11px] font-bold text-peacock">
                      Featured
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold",
                      property.reviewStatus === "Pending Review"
                        ? "bg-gold/20 text-gold-deep"
                        : property.reviewStatus === "Needs Changes"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-peacock/10 text-peacock",
                    )}
                  >
                    {property.reviewStatus ?? "Approved"}
                  </span>
                  {property.listingSource === "User" ? (
                    <span className="rounded-full bg-ice px-2.5 py-1 text-[11px] font-bold text-navy-soft">
                      User submitted
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {property.location.locality}, {property.location.city}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {property.description || "No description added yet."}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <VerificationBadge property={property} compact />
                  {property.rera?.providedNumber ? (
                    <span className="rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-bold text-navy-soft">
                      RERA: {property.rera.status?.replace(/_/g, " ") || "OWNER PROVIDED"}
                    </span>
                  ) : null}
                </div>
                {property.listingSource === "User" ? (
                  <p className="mt-2 text-xs font-semibold text-navy-soft">
                    Owner: {property.ownerName || "Not provided"} |{" "}
                    {property.ownerPhone || "No phone"}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end">
                <p className="text-sm font-bold text-navy">
                  {formatPrice(property.price, property.intent)}
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    aria-label={`Edit ${property.title}`}
                    disabled={drafts.loading || saving || uploading}
                    onClick={() =>
                      openDraft(
                        drafts.entries.find((entry) => entry.id === property.id)?.draft ?? {
                          ...property,
                          specs: { ...property.specs, area: String(property.specs.area || "") },
                        },
                      )
                    }
                    className="pv-smooth-state rounded-full border border-border p-2 text-navy hover:bg-ice"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${property.title}`}
                    disabled={drafts.loading || saving || uploading}
                    onClick={async () => {
                      try {
                        await deleteProperty(property.id);
                        if (openDraftRef.current?.id === property.id) openDraft(null);
                        if (drafts.entries.some((entry) => entry.id === property.id)) {
                          if (!(await drafts.clear(property.id))) {
                            toast.warning(
                              "The listing was removed, but its draft is still on this browser.",
                            );
                          }
                        }
                        toast.success("Listing removed.");
                      } catch (error) {
                        toast.error(
                          error instanceof Error ? error.message : "Listing could not be removed.",
                        );
                      }
                    }}
                    className="pv-smooth-state rounded-full border border-border p-2 text-destructive hover:bg-ice"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}

          {visible.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted-foreground">
              No listings match that search.
            </div>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
