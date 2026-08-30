import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  BadgeIndianRupee,
  BedDouble,
  Building2,
  Check,
  Home,
  ImagePlus,
  MapPin,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Store,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { SmartImage } from "@/components/SmartImage";
import { formatPrice } from "@/lib/api";
import { uid, useStore } from "@/lib/mock-store";
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
const furnishingOptions = ["Unfurnished", "Semi-furnished", "Furnished", "Bare shell"];
const brajCities = [
  "Vrindavan",
  "Mathura",
  "Govardhan",
  "Barsana",
  "Gokul",
  "Nandgaon",
  "Baldev",
  "Raya",
  "Chaumuha",
  "Kosi Kalan",
];
const brajLocalities = [
  "Chhatikara",
  "Ral",
  "Basonti",
  "Khamini",
  "Jachonda",
  "Aading",
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
  "Moti Jheel",
  "Raya Road",
  "Barsana Road",
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
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none transition-colors placeholder:text-muted-foreground focus:border-navy";
const labelClass = "text-xs font-semibold uppercase tracking-wide text-navy-soft";

function emptyProperty(): Property {
  return {
    id: uid("braj"),
    title: "",
    category: "Flat",
    intent: "Sale",
    price: 0,
    location: { city: "Vrindavan", locality: "Chhatikara" },
    specs: { area: 0, bedrooms: 0, bathrooms: 0, furnishing: "Semi-furnished" },
    images: [],
    amenities: ["Temple nearby", "Parking"],
    featured: false,
    status: "New",
    description: "",
  };
}

function setArrayItem<T>(items: T[], index: number, value: T) {
  return items.map((item, i) => (i === index ? value : item));
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const next = [...items];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}

function AdminProperties() {
  const { properties, saveProperty, deleteProperty, uploadPropertyImages } = useStore();
  const [draft, setDraft] = useState<Property | null>(null);
  const [search, setSearch] = useState("");
  const [intentFilter, setIntentFilter] = useState<"All" | PropertyIntent>("All");
  const [uploading, setUploading] = useState(false);

  const metrics = useMemo(
    () => ({
      all: properties.length,
      sale: properties.filter((property) => property.intent === "Sale").length,
      rent: properties.filter((property) => property.intent === "Rent").length,
      featured: properties.filter((property) => property.featured).length,
    }),
    [properties],
  );

  const visible = properties.filter((property) => {
    const matchesSearch =
      `${property.title} ${property.location.city} ${property.location.locality} ${property.category}`
        .toLowerCase()
        .includes(search.trim().toLowerCase());
    return matchesSearch && (intentFilter === "All" || property.intent === intentFilter);
  });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    if (!draft.title.trim() || !draft.location.city.trim() || !draft.location.locality.trim()) {
      toast.error("Title, city and locality are required.");
      return;
    }
    if (!draft.price || !draft.specs.area) {
      toast.error("Price and area are required.");
      return;
    }
    try {
      await saveProperty(draft);
      toast.success("Listing saved. Public pages now use the updated details.");
      setDraft(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Listing could not be saved.");
    }
  }

  async function onImageUpload(event: ChangeEvent<HTMLInputElement>) {
    if (!draft) return;
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    setUploading(true);
    try {
      const optimized = await uploadPropertyImages(files);
      setDraft((current) =>
        current ? { ...current, images: [...current.images, ...optimized] } : current,
      );
      toast.success(`${optimized.length} image${optimized.length > 1 ? "s" : ""} optimized.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
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
          onClick={() => setDraft(emptyProperty())}
          className="pv-smooth-state flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-background shadow-[var(--shadow-soft)] hover:scale-[1.02]"
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
          { label: "Featured", value: metrics.featured, icon: Sparkles },
        ].map((metric) => (
          <div
            key={metric.label}
            className="pv-lift rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-muted-foreground">{metric.label}</span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ice text-navy">
                <metric.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-navy">{metric.value}</p>
          </div>
        ))}
      </div>

      {draft ? (
        <form
          onSubmit={onSubmit}
          className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-lift)]"
        >
          <div className="grid gap-6 border-b border-border p-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div>
              <p className={labelClass}>
                {properties.some((property) => property.id === draft.id)
                  ? "Edit listing"
                  : "New listing"}
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-navy">
                {draft.title || "Braj Mandal property listing"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Follow the same flow visitors use on the public site: choose the market, set the
                exact Braj location, then add optimized images.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-ice p-2">
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

          <div className="grid gap-6 p-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-6">
              <section className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className={labelClass}>Listing title</span>
                  <input
                    className={`mt-2 ${inputClass}`}
                    placeholder="Premium plot near Prem Mandir"
                    value={draft.title}
                    onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  />
                </label>

                <label className="block">
                  <span className={labelClass}>Property type</span>
                  <select
                    className={`mt-2 ${inputClass}`}
                    value={draft.category}
                    onChange={(event) =>
                      setDraft({ ...draft, category: event.target.value as PropertyCategory })
                    }
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className={labelClass}>Status</span>
                  <select
                    className={`mt-2 ${inputClass}`}
                    value={draft.status}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        status: event.target.value as NonNullable<Property["status"]>,
                      })
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className={labelClass}>Main city</span>
                  <select
                    className={`mt-2 ${inputClass}`}
                    value={draft.location.city}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        location: { ...draft.location, city: event.target.value },
                      })
                    }
                  >
                    {brajCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className={labelClass}>Locality or village</span>
                  <select
                    className={`mt-2 ${inputClass}`}
                    value={draft.location.locality}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        location: { ...draft.location, locality: event.target.value },
                      })
                    }
                  >
                    {brajLocalities.map((locality) => (
                      <option key={locality} value={locality}>
                        {locality}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className={labelClass}>Price</span>
                  <div className="relative mt-2">
                    <BadgeIndianRupee className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      className={`${inputClass} pl-11`}
                      type="number"
                      min={0}
                      placeholder="9500000"
                      value={draft.price || ""}
                      onChange={(event) =>
                        setDraft({ ...draft, price: Number(event.target.value) })
                      }
                    />
                  </div>
                </label>

                <label className="block">
                  <span className={labelClass}>Area in sq.ft</span>
                  <input
                    className={`mt-2 ${inputClass}`}
                    type="number"
                    min={0}
                    placeholder="1800"
                    value={draft.specs.area || ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        specs: { ...draft.specs, area: Number(event.target.value) },
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
                <span className={labelClass}>Description</span>
                <textarea
                  className={`mt-2 min-h-28 ${inputClass}`}
                  placeholder="Mention road width, nearest temple or market, ownership clarity, parking and buyer or renter fit."
                  value={draft.description ?? ""}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                />
              </label>
            </div>

            <aside className="space-y-4">
              <label className="pv-smooth-state flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-navy/25 bg-ice/70 p-5 text-center hover:border-navy/50 hover:bg-ice">
                <Upload className="h-8 w-8 text-navy" />
                <span className="mt-3 text-sm font-bold text-navy">
                  {uploading ? "Optimizing images..." : "Upload property images"}
                </span>
                <span className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Select multiple photos. They are resized and converted to WebP before saving.
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={onImageUpload}
                  disabled={uploading}
                  className="sr-only"
                />
              </label>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className={labelClass}>Image list</p>
                  <span className="text-xs text-muted-foreground">{draft.images.length} saved</span>
                </div>

                {draft.images.length ? (
                  <div className="grid gap-3">
                    {draft.images.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="group overflow-hidden rounded-2xl border border-border bg-background shadow-[var(--shadow-soft)]"
                      >
                        <SmartImage
                          src={image}
                          alt={`Listing image ${index + 1}`}
                          aspect="aspect-[16/10]"
                          className="pv-smooth-state group-hover:scale-[1.03]"
                        />
                        <div className="flex items-center gap-2 p-2">
                          <input
                            value={image.startsWith("data:") ? "Optimized WebP upload" : image}
                            onChange={(event) =>
                              setDraft({
                                ...draft,
                                images: setArrayItem(draft.images, index, event.target.value),
                              })
                            }
                            className="min-w-0 flex-1 rounded-full border border-border px-3 py-2 text-xs text-navy outline-none focus:border-navy"
                            readOnly={image.startsWith("data:")}
                          />
                          <button
                            type="button"
                            aria-label="Move image up"
                            onClick={() =>
                              setDraft({ ...draft, images: moveItem(draft.images, index, -1) })
                            }
                            className="grid h-9 w-9 place-items-center rounded-full border border-border text-navy hover:bg-ice"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Move image down"
                            onClick={() =>
                              setDraft({ ...draft, images: moveItem(draft.images, index, 1) })
                            }
                            className="grid h-9 w-9 place-items-center rounded-full border border-border text-navy hover:bg-ice"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Remove image"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                images: draft.images.filter(
                                  (_, imageIndex) => imageIndex !== index,
                                ),
                              })
                            }
                            className="grid h-9 w-9 place-items-center rounded-full border border-border text-destructive hover:bg-ice"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border bg-background p-5 text-center text-sm text-muted-foreground">
                    <ImagePlus className="mx-auto h-6 w-6 text-navy-soft" />
                    <p className="mt-2">Add at least one image for the public listing gallery.</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, images: [...draft.images, ""] })}
                  className="pv-smooth-state flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs font-semibold text-navy hover:border-navy/40"
                >
                  <Plus className="h-3.5 w-3.5" /> Add image URL
                </button>
              </div>

              <label className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4 text-sm text-navy">
                <span className="font-semibold">Feature on homepage</span>
                <input
                  type="checkbox"
                  checked={Boolean(draft.featured)}
                  onChange={(event) => setDraft({ ...draft, featured: event.target.checked })}
                  className="h-5 w-5 accent-[var(--navy)]"
                />
              </label>
            </aside>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-border bg-smoke/70 p-5">
            <button
              type="submit"
              disabled={uploading}
              className="pv-smooth-state rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-background hover:scale-[1.02] disabled:opacity-60"
            >
              Save listing
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-navy"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)]">
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
                src={property.images[0] ?? ""}
                alt={property.title || "Property"}
                aspect="aspect-[4/3]"
                wrapperClassName="rounded-2xl"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-base font-extrabold text-navy">
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
                </div>

                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {property.location.locality}, {property.location.city}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {property.description || "No description added yet."}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end">
                <p className="text-sm font-bold text-navy">
                  {formatPrice(property.price, property.intent)}
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    aria-label={`Edit ${property.title}`}
                    onClick={() => setDraft(property)}
                    className="pv-smooth-state rounded-full border border-border p-2 text-navy hover:bg-ice"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${property.title}`}
                    onClick={async () => {
                      try {
                        await deleteProperty(property.id);
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
