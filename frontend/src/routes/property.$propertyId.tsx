import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Check, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { toast } from "sonner";
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
          { title: "Listing unavailable | Braj Setu Properties" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { property } = loaderData;
    const title = `${property.title}, ${property.location.locality} | Braj Setu Properties`;
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
  const { properties, hydrated, addEnquiry } = useStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactPinned, setContactPinned] = useState(false);
  const touchStart = useRef<number | null>(null);
  const galleryTouchStart = useRef<number | null>(null);

  const property = findProperty(properties, propertyId);
  const similar = property ? similarProperties(properties, property.id) : [];
  const images = property?.images.length ? property.images : [""];

  const shiftImage = useCallback(
    (direction: -1 | 1) => {
      setSelectedImage((i) => (i + direction + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    if (lightbox === null) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowRight")
        setLightbox((i) => (i === null ? i : (i + 1) % images.length));
      if (event.key === "ArrowLeft")
        setLightbox((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [images.length, lightbox]);

  useEffect(() => {
    if (lightbox !== null) return;
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, button, a")) return;
      if (event.key === "ArrowRight") shiftImage(1);
      if (event.key === "ArrowLeft") shiftImage(-1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox, shiftImage]);

  useEffect(() => {
    function onScroll() {
      setContactPinned(window.scrollY > 220);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            onClick={() => setLightbox(selectedImage)}
            onPointerDown={(event) => {
              galleryTouchStart.current = event.clientX;
            }}
            onPointerUp={(event) => {
              if (galleryTouchStart.current === null) return;
              const distance = event.clientX - galleryTouchStart.current;
              galleryTouchStart.current = null;
              if (Math.abs(distance) < 40) return;
              shiftImage(distance < 0 ? 1 : -1);
            }}
            className="pv-smooth-state overflow-hidden rounded-2xl hover:shadow-[var(--shadow-lift)]"
          >
            <SmartImage
              key={images[selectedImage]}
              src={images[selectedImage] ?? ""}
              alt={property.title}
              aspect="aspect-[16/10]"
              priority
            />
          </button>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
            {images.slice(0, 2).map((image: string, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedImage(i)}
                className="pv-smooth-state overflow-hidden rounded-2xl hover:shadow-[var(--shadow-soft)]"
              >
                <SmartImage
                  src={image}
                  alt={`${property.title} view ${i + 1}`}
                  aspect="aspect-[4/3]"
                  wrapperClassName={selectedImage === i ? "ring-2 ring-gold" : ""}
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
          <div
            className={`pv-smooth-state sticky top-24 rounded-3xl bg-card p-6 shadow-[var(--shadow-lift)] ${
              contactPinned ? "translate-y-1" : "translate-y-0"
            }`}
          >
            <p className="text-sm text-muted-foreground">Asking</p>
            <p className="text-2xl font-extrabold text-gold-deep">
              {formatPrice(property.price, property.intent)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatArea(property.specs.area)} · {property.category}
            </p>
            <ContactActions
              className="mt-6"
              message={`Hi Braj Setu Properties, I'm interested in ${property.title} (${property.id}) in ${property.location.locality}. Could you share more details?`}
            />
            <button
              type="button"
              onClick={() => setContactOpen((open) => !open)}
              className="pv-smooth-state pv-tap mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-navy px-5 text-sm font-semibold text-navy hover:bg-navy hover:text-background"
            >
              <CalendarCheck className="h-4 w-4" />
              Book a visit
            </button>
            {contactOpen && (
              <LeadForm
                property={property}
                onSubmit={addEnquiry}
                onSuccess={() => {
                  toast.success("An advisor will reach out within 4 working hours.");
                }}
              />
            )}
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
      <div className="pv-smooth-state fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur-md lg:hidden">
        {contactOpen ? (
          <LeadForm
            property={property}
            onSubmit={addEnquiry}
            onSuccess={() => {
              toast.success("An advisor will reach out within 4 working hours.");
            }}
          />
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
            <ContactActions
              layout="row"
              message={`Hi Braj Setu Properties, I'm interested in ${property.title} (${property.id}).`}
            />
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="pv-smooth-state pv-tap rounded-full bg-navy px-4 text-sm font-semibold text-background hover:scale-[1.02]"
            >
              Visit
            </button>
          </div>
        )}
      </div>

      {lightbox !== null && (
        <div
          className="pv-page-transition fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4"
          onPointerDown={(event) => {
            touchStart.current = event.clientX;
          }}
          onPointerUp={(event) => {
            if (touchStart.current === null) return;
            const distance = event.clientX - touchStart.current;
            touchStart.current = null;
            if (Math.abs(distance) < 40) return;
            setLightbox((i) =>
              i === null
                ? i
                : distance < 0
                  ? (i + 1) % images.length
                  : (i - 1 + images.length) % images.length,
            );
          }}
        >
          <button
            type="button"
            aria-label="Close gallery"
            onClick={() => setLightbox(null)}
            className="pv-smooth-state absolute top-5 right-5 grid h-11 w-11 place-items-center rounded-full bg-background text-navy hover:scale-[1.03]"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() =>
              setLightbox((i) => (i === null ? i : (i - 1 + images.length) % images.length))
            }
            className="pv-smooth-state absolute left-5 grid h-11 w-11 place-items-center rounded-full bg-background text-navy hover:scale-[1.03]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => setLightbox((i) => (i === null ? i : (i + 1) % images.length))}
            className="pv-smooth-state absolute right-5 grid h-11 w-11 place-items-center rounded-full bg-background text-navy hover:scale-[1.03]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <img
            key={images[lightbox]}
            src={images[lightbox]}
            alt={property.title}
            className="pv-page-transition max-h-[85vh] w-auto max-w-full rounded-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
}

interface LeadFormValues {
  name: string;
  phone: string;
}

function LeadForm({
  property,
  onSubmit,
  onSuccess,
}: {
  property: Property;
  onSubmit: (input: {
    name: string;
    email: string;
    phone: string;
    message: string;
    propertyId?: string;
  }) => Promise<void>;
  onSuccess: () => void;
}) {
  const [values, setValues] = useState<LeadFormValues>({ name: "", phone: "" });
  const [errors, setErrors] = useState<Partial<LeadFormValues>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Partial<LeadFormValues> = {};
    if (values.name.trim().length < 2) nextErrors.name = "Enter your name.";
    if (!/^[0-9+\-\s()]{8,15}$/.test(values.phone)) nextErrors.phone = "Enter a valid phone.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSending(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        email: "lead@brajsetuproperties.in",
        phone: values.phone.trim(),
        propertyId: property.id,
        message: `Visit request for ${property.title} (${property.id}) in ${property.location.locality}.`,
      });
      setSent(true);
      onSuccess();
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-4 rounded-2xl bg-ice p-4 text-sm font-medium text-navy">
        <Check className="mr-2 inline h-4 w-4 text-gold-deep" />
        An advisor will reach out within 4 working hours.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="pv-page-transition mt-4 space-y-3 rounded-2xl bg-ice p-4">
      <input
        value={values.name}
        onChange={(event) => {
          setValues((current) => ({ ...current, name: event.target.value }));
          setErrors((current) => ({ ...current, name: undefined }));
        }}
        onBlur={() =>
          setErrors((current) => ({
            ...current,
            name: values.name.trim().length < 2 ? "Enter your name." : undefined,
          }))
        }
        aria-invalid={Boolean(errors.name)}
        placeholder="Your name"
        className="pv-smooth-state min-h-11 w-full rounded-full border border-border bg-background px-4 text-sm text-navy outline-none focus:border-gold"
      />
      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      <input
        value={values.phone}
        onChange={(event) => {
          setValues((current) => ({ ...current, phone: event.target.value }));
          setErrors((current) => ({ ...current, phone: undefined }));
        }}
        onBlur={() =>
          setErrors((current) => ({
            ...current,
            phone: /^[0-9+\-\s()]{8,15}$/.test(values.phone) ? undefined : "Enter a valid phone.",
          }))
        }
        aria-invalid={Boolean(errors.phone)}
        placeholder="+91 90000 00000"
        className="pv-smooth-state min-h-11 w-full rounded-full border border-border bg-background px-4 text-sm text-navy outline-none focus:border-gold"
      />
      {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
      <button
        type="submit"
        disabled={sending}
        className="pv-smooth-state pv-tap flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
      >
        {sending && <Loader2 className="h-4 w-4 animate-spin" />}
        {sending ? "Sending..." : "Request visit"}
      </button>
    </form>
  );
}
