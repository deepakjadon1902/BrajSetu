import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { ContactActions } from "@/components/ContactActions";
import { MapPlaceholder } from "@/components/MapPlaceholder";
import { PropertyCard } from "@/components/PropertyCard";
import { SmartImage } from "@/components/SmartImage";
import type { Property } from "@/types/property";
import {
  findProperty,
  formatArea,
  formatPrice,
  getPropertyById,
  similarProperties,
} from "@/lib/api";
import { useStore } from "@/lib/mock-store";

export const Route = createFileRoute("/property/$propertyId")({
  // Seed lookup powers SSR metadata; the page itself renders from the live
  // (admin-managed) catalogue so newly created listings resolve too.
  loader: ({ params }) => ({ property: getPropertyById(params.propertyId) ?? null }),
  head: ({ loaderData }) => {
    if (!loaderData?.property) {
      return {
        meta: [
          { title: "Listing unavailable | PropVista" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { property } = loaderData;
    const title = `${property.title}, ${property.location.locality} | PropVista`;
    const description = `${property.category} for ${property.intent.toLowerCase()} in ${property.location.locality}, ${property.location.city} — ${formatArea(property.specs.area)} at ${formatPrice(property.price, property.intent)}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: PropertyDetailPage,
});

function PropertyDetailPage() {
  const { propertyId } = Route.useParams();
  const { properties, hydrated } = useStore();
  const [lightbox, setLightbox] = useState<string | null>(null);

  const property = findProperty(properties, propertyId);
  const similar = property ? similarProperties(properties, property.id) : [];

  if (!property) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-smoke px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">
            {hydrated ? "This listing is no longer available" : "Loading listing…"}
          </h1>
          {hydrated ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                It may have been sold, rented or removed by our team.
              </p>
              <Link
                to="/buy"
                search={{ q: undefined }}
                className="pv-tap mt-6 inline-flex items-center rounded-full bg-navy px-6 text-sm font-semibold text-background"
              >
                Browse listings
              </Link>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  const specs: [string, string][] = [
    ["Price", formatPrice(property.price, property.intent)],
    ["Area", formatArea(property.specs.area)],
    ["Bedrooms", property.specs.bedrooms ? String(property.specs.bedrooms) : "—"],
    ["Bathrooms", property.specs.bathrooms ? String(property.specs.bathrooms) : "—"],
    ["Furnishing", property.specs.furnishing ?? "—"],
    ["Category", property.category],
    ["Intent", `For ${property.intent}`],
    ["Status", property.status ?? "Active"],
  ];

  return (
    <div className="bg-smoke pb-28 lg:pb-16">
      <div className="pv-container pt-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-widest text-gold-deep uppercase">
              {property.category} · For {property.intent}
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-navy sm:text-4xl">
              {property.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {property.location.locality}, {property.location.city}
            </p>
          </div>
          <p className="shrink-0 text-xl font-extrabold text-gold-deep sm:text-3xl">
            {formatPrice(property.price, property.intent)}
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <button
            type="button"
            onClick={() => setLightbox(property.images[0] ?? null)}
            className="overflow-hidden rounded-2xl"
          >
            <SmartImage
              src={property.images[0] ?? ""}
              alt={property.title}
              aspect="aspect-[16/10]"
              priority
            />
          </button>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
            {property.images.slice(1, 3).map((image: string, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightbox(image)}
                className="overflow-hidden rounded-2xl"
              >
                <SmartImage
                  src={image}
                  alt={`${property.title} view ${i + 2}`}
                  aspect="aspect-[4/3]"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pv-container mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          <section className="rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <h2 className="text-xl font-bold text-navy">About this property</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {property.description}
            </p>
          </section>

          <section className="rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <h2 className="text-xl font-bold text-navy">Specifications</h2>
            <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {specs.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-border pb-3"
                >
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-semibold text-navy">{value}</dd>
                </div>
              ))}
            </dl>

            {property.amenities.length > 0 && (
              <>
                <h3 className="mt-8 text-sm font-semibold tracking-wide text-navy uppercase">
                  Amenities
                </h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {property.amenities.map((amenity: string) => (
                    <li
                      key={amenity}
                      className="flex items-center gap-2 rounded-full bg-ice px-4 py-2 text-xs font-medium text-navy"
                    >
                      <Check className="h-3.5 w-3.5 text-gold-deep" />
                      {amenity}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section className="rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <h2 className="text-xl font-bold text-navy">Location</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {property.location.locality}, {property.location.city}
            </p>
            <MapPlaceholder
              className="mt-5 h-72 min-h-0"
              pins={[{ id: property.id, label: property.location.locality, x: 50, y: 55 }]}
            />
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl bg-card p-6 shadow-[var(--shadow-lift)]">
            <p className="text-sm text-muted-foreground">Asking</p>
            <p className="text-2xl font-extrabold text-gold-deep">
              {formatPrice(property.price, property.intent)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatArea(property.specs.area)} · {property.category}
            </p>
            <ContactActions
              className="mt-6"
              message={`Hi PropVista, I'm interested in ${property.title} (${property.id}) in ${property.location.locality}. Could you share more details?`}
            />
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              An advisor who knows this micro-market will respond, usually within a few hours on
              working days.
            </p>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="pv-container mt-16">
          <h2 className="text-2xl font-extrabold tracking-tight text-navy">Similar listings</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((item: Property) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky booking bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur-md lg:hidden">
        <ContactActions
          layout="row"
          message={`Hi PropVista, I'm interested in ${property.title} (${property.id}).`}
        />
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4">
          <button
            type="button"
            aria-label="Close gallery"
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 grid h-11 w-11 place-items-center rounded-full bg-background text-navy"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox}
            alt={property.title}
            className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
}
