import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/api";
import { uid, useStore } from "@/lib/mock-store";
import type { Property, PropertyCategory, PropertyIntent } from "@/types/property";

export const Route = createFileRoute("/admin/properties")({
  head: () => ({
    meta: [
      { title: "Properties | PropVista Admin" },
      {
        name: "description",
        content: "Create, edit and remove PropVista property listings.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Properties | PropVista Admin" },
      { property: "og:description", content: "Manage PropVista listings." },
    ],
  }),
  component: AdminProperties,
});

const categories: PropertyCategory[] = ["Shop", "Flat", "Plot", "House", "Farm House"];
const intents: PropertyIntent[] = ["Sale", "Rent"];

const inputClass =
  "w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-navy outline-none focus:border-navy";

function emptyProperty(): Property {
  return {
    id: uid("pv"),
    title: "",
    category: "Flat",
    intent: "Sale",
    price: 0,
    location: { city: "", locality: "" },
    specs: { area: 0, bedrooms: 0, bathrooms: 0, furnishing: "Unfurnished" },
    images: [],
    amenities: [],
    featured: false,
    status: "New",
    description: "",
  };
}

function AdminProperties() {
  const { properties, saveProperty, deleteProperty } = useStore();
  const [draft, setDraft] = useState<Property | null>(null);
  const [search, setSearch] = useState("");

  const visible = properties.filter((p) =>
    `${p.title} ${p.location.city} ${p.location.locality} ${p.category}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    if (!draft.title.trim() || !draft.location.city.trim()) {
      toast.error("Title and city are required.");
      return;
    }
    saveProperty(draft);
    toast.success("Listing saved.");
    setDraft(null);
  }

  return (
    <AdminShell
      title="Properties"
      description="Every listing shown across Buy, Rent and Sale."
      actions={
        <button
          type="button"
          onClick={() => setDraft(emptyProperty())}
          className="flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-background"
        >
          <Plus className="h-4 w-4" /> New listing
        </button>
      }
    >
      {draft ? (
        <form
          onSubmit={onSubmit}
          className="mb-6 rounded-3xl border border-border bg-card p-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-wide text-navy">
            {properties.some((p) => p.id === draft.id) ? "Edit listing" : "New listing"}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <input
              className={inputClass}
              placeholder="Title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <select
              className={inputClass}
              value={draft.category}
              onChange={(e) =>
                setDraft({ ...draft, category: e.target.value as PropertyCategory })
              }
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              className={inputClass}
              value={draft.intent}
              onChange={(e) =>
                setDraft({ ...draft, intent: e.target.value as PropertyIntent })
              }
            >
              {intents.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
            <input
              className={inputClass}
              type="number"
              placeholder="Price (₹)"
              value={draft.price || ""}
              onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
            />
            <input
              className={inputClass}
              placeholder="City"
              value={draft.location.city}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  location: { ...draft.location, city: e.target.value },
                })
              }
            />
            <input
              className={inputClass}
              placeholder="Locality"
              value={draft.location.locality}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  location: { ...draft.location, locality: e.target.value },
                })
              }
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Area (sq.ft)"
              value={draft.specs.area || ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  specs: { ...draft.specs, area: Number(e.target.value) },
                })
              }
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Bedrooms"
              value={draft.specs.bedrooms ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  specs: { ...draft.specs, bedrooms: Number(e.target.value) },
                })
              }
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Bathrooms"
              value={draft.specs.bathrooms ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  specs: { ...draft.specs, bathrooms: Number(e.target.value) },
                })
              }
            />
            <input
              className={`${inputClass} sm:col-span-2 xl:col-span-3`}
              placeholder="Amenities (comma separated)"
              value={draft.amenities.join(", ")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  amenities: e.target.value
                    .split(",")
                    .map((a) => a.trim())
                    .filter(Boolean),
                })
              }
            />
            <input
              className={`${inputClass} sm:col-span-2 xl:col-span-3`}
              placeholder="Image URLs (comma separated)"
              value={draft.images.join(", ")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  images: e.target.value
                    .split(",")
                    .map((a) => a.trim())
                    .filter(Boolean),
                })
              }
            />
            <textarea
              className={`${inputClass} sm:col-span-2 xl:col-span-3`}
              rows={3}
              placeholder="Description"
              value={draft.description ?? ""}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-navy">
            <input
              type="checkbox"
              checked={Boolean(draft.featured)}
              onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
              className="h-4 w-4 accent-[var(--navy)]"
            />
            Feature on the homepage
          </label>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-background"
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

      <div className="rounded-3xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <input
            className={`${inputClass} max-w-sm`}
            placeholder="Search listings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((property) => (
                <tr key={property.id}>
                  <td className="px-4 py-3 font-semibold text-navy">
                    {property.title || "Untitled"}
                    {property.featured ? (
                      <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase text-gold-deep">
                        Featured
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {property.category} · {property.intent}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {property.location.locality}, {property.location.city}
                  </td>
                  <td className="px-4 py-3 font-medium text-navy">
                    {formatPrice(property.price, property.intent)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        aria-label={`Edit ${property.title}`}
                        onClick={() => setDraft(property)}
                        className="rounded-full border border-border p-2 text-navy hover:bg-ice"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${property.title}`}
                        onClick={() => {
                          deleteProperty(property.id);
                          toast.success("Listing removed.");
                        }}
                        className="rounded-full border border-border p-2 text-destructive hover:bg-ice"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No listings match that search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
