import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AirVent,
  BedDouble,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Fan,
  Heart,
  Home,
  Lamp,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Trees,
  Warehouse,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
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
import { getMainImage, normalizePropertyImage } from "@/lib/property-images";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/mock-store";
import type { PropertyImageLabel } from "@/types/property";

export const Route = createFileRoute("/property/$propertyId")({
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
    const description = `${property.category} for ${property.intent.toLowerCase()} in ${property.location.locality}, ${property.location.city} - ${formatArea(property.specs.area)} at ${formatDisplayPrice(property.price, property.intent)}.`;

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

type SectionId = "overview" | "furnishings" | "amenities" | "ratings" | "price" | "neighbourhood";

type GalleryCategory = PropertyImageLabel | "Contact";

type GalleryPhoto = {
  src: string;
  label: GalleryCategory;
};

const sectionTabs: { id: SectionId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "furnishings", label: "Furnishings" },
  { id: "amenities", label: "Amenities" },
  { id: "ratings", label: "Ratings and Reviews" },
  { id: "price", label: "Price Trends" },
  { id: "neighbourhood", label: "Explore Neighbourhood" },
];

const galleryPills: GalleryCategory[] = ["Bedroom", "Kitchen", "Bathroom", "Balcony", "Contact"];

const furnishingItems: {
  label: string;
  icon: LucideIcon;
  value: (property: Property) => string;
}[] = [
  { label: "Fan", icon: Fan, value: () => "2" },
  { label: "Light", icon: Lamp, value: () => "6" },
  {
    label: "Wardrobe",
    icon: Warehouse,
    value: (property) => (property.category === "Plot" ? "0" : "2"),
  },
  {
    label: "AC",
    icon: AirVent,
    value: (property) => (property.specs.furnishing === "Furnished" ? "2" : "1"),
  },
  { label: "Bed", icon: BedDouble, value: (property) => String(property.specs.bedrooms ?? 1) },
  { label: "Geyser", icon: Zap, value: (property) => String(property.specs.bathrooms ?? 1) },
];

const sectionCardClass =
  "scroll-mt-36 rounded-lg border border-border bg-card shadow-[var(--shadow-soft)]";

function PropertyDetailPage() {
  const { propertyId } = Route.useParams();
  const { properties, hydrated, addEnquiry, settings } = useStore();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [activeTab, setActiveTab] = useState<SectionId>("overview");
  const [contactOpen, setContactOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);

  const property = findProperty(properties, propertyId);
  const similar = property ? similarProperties(properties, property.id, 3) : [];
  const galleryPhotos = useMemo(() => (property ? buildGalleryPhotos(property) : []), [property]);
  const activeGallery = galleryPhotos[activePhoto] ?? galleryPhotos[0];
  const displayPrice = property ? formatDisplayPrice(property.price, property.intent) : "";
  const phoneHref = settings.contactPhone.replace(/\s/g, "");

  const shiftPhoto = useCallback(
    (direction: -1 | 1) => {
      setActivePhoto((index) => (index + direction + galleryPhotos.length) % galleryPhotos.length);
    },
    [galleryPhotos.length],
  );

  useEffect(() => {
    if (!galleryOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setGalleryOpen(false);
      if (event.key === "ArrowRight") shiftPhoto(1);
      if (event.key === "ArrowLeft") shiftPhoto(-1);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [galleryOpen, shiftPhoto]);

  useEffect(() => {
    const node = stripRef.current?.querySelector<HTMLElement>(
      `[data-photo-index="${activePhoto}"]`,
    );
    node?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activePhoto]);

  useEffect(() => {
    function onScroll() {
      const current = sectionTabs.findLast((tab) => {
        const el = document.getElementById(tab.id);
        return el ? el.getBoundingClientRect().top <= 170 : false;
      });
      if (current) setActiveTab(current.id);
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
            {hydrated ? "This listing is no longer available" : "Loading listing..."}
          </h1>
          {hydrated ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                It may have been sold, rented or removed by our team.
              </p>
              <Link
                to="/buy"
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

  const overviewRows = [
    ["Security", property.intent === "Rent" ? displayPrice : "Included"],
    ["Area Unit", "square_feet"],
    ["Built up area", formatArea(property.specs.area)],
    ["Furnishing", property.specs.furnishing ?? "Unfurnished"],
    ["Bathrooms", String(property.specs.bathrooms ?? 0)],
    ["Balcony", property.category === "Plot" ? "No" : "1"],
    ["Available from", "Available now"],
    ["Floor number", property.category === "Flat" ? "2 of 5 floors" : "Ground plus one"],
    ["Lease type", property.intent === "Rent" ? "Family / Company / Bachelor" : "Freehold"],
    ["Parking", "1 Covered and 1 Open Parking"],
    ["Gas Pipeline", property.amenities.includes("Storage") ? "No" : "Yes"],
    ["Gate Community", property.amenities.length > 0 ? "Yes" : "No"],
    ["Carpet area", formatArea(Math.round(property.specs.area * 0.86))],
    ["Price Negotiable", property.status === "Price Drop" ? "Yes" : "No"],
  ];

  const quickSpecs = [
    {
      label: "Configuration",
      value: property.specs.bedrooms ? `${property.specs.bedrooms} BHK` : property.category,
    },
    { label: "Area", value: formatArea(property.specs.area) },
    { label: "Furnishing", value: property.specs.furnishing ?? "Unfurnished" },
    { label: "Status", value: property.status ?? "Active" },
  ];

  return (
    <div className="bg-[#f5f3f0] pb-20 text-navy">
      <div className="bg-card">
        <div className="mx-auto max-w-[76rem] px-4 pt-4 sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground">
            Home / {property.location.city} / {property.location.locality} / {property.category} for{" "}
            {property.intent}
          </p>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
                  {property.title}
                </h1>
                <IconButton
                  label="Share property"
                  icon={Share2}
                  onClick={() => toast.success("Share link ready")}
                />
                <IconButton
                  label={saved ? "Saved" : "Save property"}
                  icon={Heart}
                  active={saved}
                  onClick={() => {
                    setSaved((value) => !value);
                    toast.success(saved ? "Removed from saved" : "Saved for later");
                  }}
                />
              </div>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                {property.specs.furnishing ?? "Unfurnished"} | {formatArea(property.specs.area)}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-gold-deep" />
                {property.location.locality}, {property.location.city}
              </p>
            </div>

            <div className="lg:text-right">
              <p className="text-xs text-muted-foreground">Last updated: Today</p>
              <p className="mt-2 text-3xl font-black text-navy">{displayPrice}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {property.intent === "Rent" ? "Added 3 days ago" : "Ready for site visits"}
              </p>
              <a
                href={`tel:${phoneHref}`}
                className="pv-smooth-state mt-4 inline-flex h-11 items-center justify-center rounded-md bg-[#10c986] px-5 text-sm font-bold text-white shadow-[0_14px_28px_-20px_rgba(16,201,134,0.9)] hover:scale-[1.02]"
              >
                Contact Seller
              </a>
            </div>
          </div>

          <HeroGallery
            property={property}
            photos={galleryPhotos}
            onOpen={(index) => {
              setActivePhoto(index);
              setGalleryOpen(true);
            }}
          />
        </div>
      </div>

      <StickyTabs activeTab={activeTab} onSelect={scrollToSection} />

      <div className="mx-auto grid max-w-[76rem] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <main className="min-w-0 space-y-4">
          <section id="overview" className={cn(sectionCardClass, "p-5 sm:p-6")}>
            <h2 className="text-xl font-extrabold">Overview</h2>
            <div className="mt-5 grid gap-x-14 gap-y-7 sm:grid-cols-2">
              {overviewRows.map(([label, value]) => (
                <div key={label}>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-navy">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <h3 className="font-extrabold">About this property</h3>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                {property.description} This listing is curated by Braj Setu Properties with verified
                photos, practical neighbourhood guidance and visit support from enquiry to final
                decision.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button className="pv-tap inline-flex min-w-40 items-center justify-center gap-2 rounded-md bg-[#ede7ff] px-6 text-sm font-bold text-[#5a25e6]">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button
                  onClick={() => setSaved((value) => !value)}
                  className="pv-tap inline-flex min-w-40 items-center justify-center gap-2 rounded-md bg-[#ede7ff] px-6 text-sm font-bold text-[#5a25e6]"
                >
                  <Heart className={cn("h-4 w-4", saved && "fill-current")} />
                  Save
                </button>
              </div>
            </div>
          </section>

          <HighlightsCard property={property} />

          <section id="furnishings" className={cn(sectionCardClass, "p-5 sm:p-6")}>
            <h2 className="text-xl font-extrabold">Furnishings</h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {furnishingItems.map((item) => (
                <FeatureTile
                  key={item.label}
                  icon={item.icon}
                  title={item.label}
                  value={item.value(property)}
                />
              ))}
            </div>
          </section>

          <section id="amenities" className={cn(sectionCardClass, "p-5 sm:p-6")}>
            <h2 className="text-xl font-extrabold">Amenities</h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {buildAmenities(property).map((amenity) => (
                <FeatureTile key={amenity.label} icon={amenity.icon} title={amenity.label} />
              ))}
            </div>
          </section>

          <CommercialStrip locality={property.location.locality} />

          <section id="ratings" className={cn(sectionCardClass, "p-5 sm:p-6")}>
            <p className="text-sm text-muted-foreground">Resident reviews for</p>
            <h2 className="mt-1 text-xl font-extrabold">{property.location.locality}</h2>
            <div className="mt-7 grid gap-6 sm:grid-cols-4">
              {[
                ["4/5", "Connectivity"],
                ["4.3/5", "Neighbourhood"],
                ["4.3/5", "Safety"],
                ["4.3/5", "Livability"],
              ].map(([score, label]) => (
                <div key={label} className="text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#53d99b] bg-[#effdf6]">
                    <Star className="h-5 w-5 fill-[#53d99b] text-[#53d99b]" />
                  </div>
                  <p className="mt-2 text-sm font-extrabold">{score}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-7 grid gap-6 border-t border-border pt-6 md:grid-cols-2">
              <ReviewPills
                title="Good things here"
                icon={Sparkles}
                items={[
                  "Budget-friendly",
                  "Good restaurants nearby",
                  "Public transportation",
                  "Peaceful locality",
                ]}
              />
              <ReviewPills
                title="Things that need improvement"
                icon={Zap}
                items={[
                  "Limited late-night transport",
                  "Parking on busy days",
                  "Market rush at peak hours",
                ]}
              />
            </div>
          </section>

          <section id="price" className={cn(sectionCardClass, "p-5 sm:p-6")}>
            <h2 className="text-xl font-extrabold">Price Trends</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {quickSpecs.map((item) => (
                <div key={item.label} className="rounded-lg border border-border bg-smoke p-4">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-base font-extrabold">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-dashed border-[#6d3ff1] bg-[#faf8ff] p-4">
              <p className="text-sm font-semibold text-[#5a25e6]">
                Better priced property compared with similar active listings in this micro-market.
              </p>
            </div>
          </section>

          <TourPhotos
            photos={galleryPhotos}
            onOpen={(index) => {
              setActivePhoto(index);
              setGalleryOpen(true);
            }}
          />

          <section id="neighbourhood" className={cn(sectionCardClass, "p-5 sm:p-6")}>
            <h2 className="text-xl font-extrabold">
              Explore Neighbourhood - {property.location.locality}
            </h2>
            <MapPlaceholder
              className="mt-5 h-80 min-h-0 rounded-md"
              pins={[{ id: property.id, label: property.location.locality, x: 50, y: 55 }]}
            />
            <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {["Education", "Healthcare", "Commute", "Food", "Shopping", "Parks"].map((item) => (
                <div key={item} className="text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-card shadow-[var(--shadow-soft)]">
                    <MapPin className="h-4 w-4 text-[#6d3ff1]" />
                  </div>
                  <p className="mt-2 truncate text-xs font-medium">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {similar.length > 0 && (
            <section className={cn(sectionCardClass, "p-5 sm:p-6")}>
              <h2 className="text-xl font-extrabold">Similar properties in this locality</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {similar.map((item) => (
                  <PropertyCard key={item.id} property={item} />
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="hidden lg:block">
          <ContactPanel
            property={property}
            phoneHref={phoneHref}
            contactOpen={contactOpen}
            setContactOpen={setContactOpen}
          />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-[0_-18px_38px_-28px_rgba(18,35,63,0.7)] backdrop-blur-md lg:hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <a
            href={`tel:${phoneHref}`}
            className="pv-tap flex items-center justify-center gap-2 rounded-md bg-[#10c986] px-4 text-sm font-bold text-white"
          >
            <Phone className="h-4 w-4" />
            Contact Seller
          </a>
          <button
            onClick={() => setContactOpen(true)}
            className="pv-tap rounded-md border border-[#6d3ff1] px-4 text-sm font-bold text-[#5a25e6]"
          >
            Visit
          </button>
        </div>
      </div>

      {galleryOpen && activeGallery ? (
        <GalleryViewer
          property={property}
          photos={galleryPhotos}
          activePhoto={activePhoto}
          activeGallery={activeGallery}
          stripRef={stripRef}
          touchStart={touchStart}
          onClose={() => setGalleryOpen(false)}
          onShift={shiftPhoto}
          onSelect={setActivePhoto}
          onContact={() => {
            setGalleryOpen(false);
            setContactOpen(true);
            setTimeout(() => scrollToSection("overview"), 0);
          }}
          phoneHref={phoneHref}
          displayPrice={displayPrice}
        />
      ) : null}

      {contactOpen ? (
        <div className="fixed inset-0 z-50 bg-black/55 p-4 backdrop-blur-sm lg:hidden">
          <div className="mx-auto mt-16 max-w-sm rounded-lg bg-card p-5 shadow-[var(--shadow-float)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold">Contact Seller</h2>
                <p className="mt-1 text-sm text-muted-foreground">{property.title}</p>
              </div>
              <button
                type="button"
                aria-label="Close contact form"
                onClick={() => setContactOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-navy"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <LeadForm
              property={property}
              onSubmit={addEnquiry}
              onSuccess={() => {
                toast.success("Contact details sent. An advisor will call shortly.");
                setContactOpen(false);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HeroGallery({
  property,
  photos,
  onOpen,
}: {
  property: Property;
  photos: GalleryPhoto[];
  onOpen: (index: number) => void;
}) {
  const visible = photos.slice(0, 4);

  return (
    <div className="relative mt-7 grid h-[22rem] gap-1 overflow-hidden rounded-[1.35rem] border border-gold/20 bg-card shadow-[0_30px_80px_-38px_rgba(18,35,63,0.62)] sm:h-[28rem] lg:grid-cols-[2fr_0.85fr]">
      <button type="button" onClick={() => onOpen(0)} className="relative min-h-0 overflow-hidden">
        <SmartImage
          src={visible[0]?.src ?? getMainImage(property)}
          alt={`${property.title} bedroom`}
          aspect="h-full"
          className="object-cover"
          priority
        />
        <ImageLabel label={visible[0]?.label ?? "Bedroom"} />
        <div className="absolute top-4 right-4 hidden gap-3 sm:flex">
          <ActionPill icon={Share2} label="Share" />
          <ActionPill icon={Heart} label="Save" />
        </div>
      </button>
      <div className="hidden grid-rows-2 gap-1 lg:grid">
        {visible.slice(1, 3).map((photo, index) => (
          <button
            key={`${photo.label}-${index}`}
            type="button"
            onClick={() => onOpen(index + 1)}
            className="relative overflow-hidden"
          >
            <SmartImage src={photo.src} alt={`${property.title} ${photo.label}`} aspect="h-full" />
            <ImageLabel label={photo.label} />
            {index === 1 ? (
              <div className="absolute inset-0 grid place-items-center bg-navy/45 text-center text-3xl font-black text-white">
                <span>+{Math.max(photos.length - 3, 1)} more</span>
              </div>
            ) : null}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onOpen(0)}
        className="absolute right-5 bottom-5 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-bold text-navy shadow-[var(--shadow-soft)] lg:hidden"
      >
        <Camera className="h-4 w-4" />
        View Photos
      </button>
    </div>
  );
}

function StickyTabs({
  activeTab,
  onSelect,
}: {
  activeTab: SectionId;
  onSelect: (id: SectionId) => void;
}) {
  return (
    <div className="sticky top-16 z-30 border-y border-border bg-card/95 shadow-[0_10px_24px_-24px_rgba(18,35,63,0.55)] backdrop-blur-md md:top-[4.25rem]">
      <div className="pv-no-scrollbar mx-auto flex max-w-[76rem] gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {sectionTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={cn(
              "relative h-16 shrink-0 px-3 text-sm font-extrabold text-navy uppercase transition-colors",
              activeTab === tab.id && "text-[#5a25e6]",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#6d3ff1] opacity-0",
                activeTab === tab.id && "opacity-100",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function GalleryViewer({
  property,
  photos,
  activePhoto,
  activeGallery,
  stripRef,
  touchStart,
  onClose,
  onShift,
  onSelect,
  onContact,
  phoneHref,
  displayPrice,
}: {
  property: Property;
  photos: GalleryPhoto[];
  activePhoto: number;
  activeGallery: GalleryPhoto;
  stripRef: React.RefObject<HTMLDivElement | null>;
  touchStart: React.MutableRefObject<number | null>;
  onClose: () => void;
  onShift: (direction: -1 | 1) => void;
  onSelect: (index: number) => void;
  onContact: () => void;
  phoneHref: string;
  displayPrice: string;
}) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] grid grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(201,161,53,0.18),transparent_28%),linear-gradient(180deg,#070707_0%,#000_100%)] text-white">
      <div className="relative z-30 border-b border-white/10 bg-black/82 shadow-[0_22px_70px_-34px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="mx-auto grid max-w-[84rem] grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center lg:px-8">
          <div className="min-w-0 pr-1">
            <p className="truncate text-lg leading-tight font-black">{property.title}</p>
            <p className="mt-1 text-base font-extrabold">{displayPrice}</p>
            <div className="pv-no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
              {galleryPills.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() =>
                    pill === "Contact" ? onContact() : jumpToCategory(photos, pill, onSelect)
                  }
                  className={cn(
                    "h-9 shrink-0 rounded-full border px-4 text-xs font-bold transition",
                    pill === activeGallery.label
                      ? "border-gold bg-white text-navy shadow-[0_12px_28px_-20px_rgba(201,161,53,0.8)]"
                      : "border-white/30 bg-white/5 text-white/75 hover:border-white hover:bg-white/10 hover:text-white",
                  )}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="min-w-24">
              <p className="text-right text-sm font-black text-white">
                {activePhoto + 1}/{photos.length}
              </p>
              <div className="mt-2 h-1 rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold to-[#10c986]"
                  style={{ width: `${((activePhoto + 1) / photos.length) * 100}%` }}
                />
              </div>
            </div>
            <a
              href={`tel:${phoneHref}`}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#10c986] px-5 text-sm font-black whitespace-nowrap text-white shadow-[0_18px_34px_-22px_rgba(16,201,134,0.85)] transition hover:scale-[1.02] hover:bg-[#16d894] sm:px-8"
            >
              Contact Seller
            </a>
          </div>

          <button
            type="button"
            aria-label="Close gallery"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/12 px-4 text-sm font-black text-white shadow-[0_16px_34px_-26px_rgba(255,255,255,0.75)] backdrop-blur transition hover:scale-[1.02] hover:bg-white/20 lg:static"
          >
            <X className="h-5 w-5" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous image"
        onClick={() => onShift(-1)}
        className="absolute top-1/2 left-3 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>
      <button
        type="button"
        aria-label="Next image"
        onClick={() => onShift(1)}
        className="absolute top-1/2 right-3 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      <div
        ref={stripRef}
        className="pv-no-scrollbar relative z-10 flex min-h-0 snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 pt-5 sm:px-[8vw] lg:px-[14vw]"
        onPointerDown={(event) => {
          touchStart.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (touchStart.current === null) return;
          const distance = event.clientX - touchStart.current;
          touchStart.current = null;
          if (Math.abs(distance) > 40) onShift(distance < 0 ? 1 : -1);
        }}
      >
        {photos.map((photo, index) => (
          <button
            key={`${photo.label}-${index}`}
            data-photo-index={index}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              "relative h-full min-w-[min(34rem,82vw)] snap-center overflow-hidden rounded-[1.15rem] border border-white/10 bg-white/5 opacity-50 shadow-[0_24px_70px_-34px_rgba(0,0,0,0.9)] transition duration-300 sm:min-w-[min(38rem,72vw)] lg:min-w-[36rem]",
              index === activePhoto &&
                "scale-[1.01] border-gold/55 opacity-100 shadow-[0_30px_90px_-34px_rgba(201,161,53,0.45)]",
            )}
          >
            <img
              src={photo.src}
              alt={`${property.title} ${photo.label}`}
              className="h-full w-full object-cover"
            />
            <ImageLabel label={photo.label} dark />
            <span className="absolute right-4 bottom-4 grid h-8 w-8 place-items-center rounded-md bg-black/55">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
}

function ContactPanel({
  property,
  phoneHref,
  contactOpen,
  setContactOpen,
}: {
  property: Property;
  phoneHref: string;
  contactOpen: boolean;
  setContactOpen: (open: boolean) => void;
}) {
  const { addEnquiry } = useStore();

  return (
    <div className="sticky top-40 space-y-4">
      <div className="rounded-md border border-[#f3cd43] bg-[#fffdf1] px-4 py-3 text-sm font-medium text-navy">
        <Zap className="mr-2 inline h-4 w-4 fill-[#f3b300] text-[#f3b300]" />
        Great choice! Better priced property in this area
      </div>
      <div className="rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-xl font-extrabold">Contact Seller</h2>
        <div className="mt-5 flex items-center gap-3">
          <div className="grid h-13 w-13 place-items-center rounded-md bg-smoke">
            <Home className="h-6 w-6 text-gold-deep" />
          </div>
          <div>
            <p className="text-sm font-extrabold">Braj Setu Advisor</p>
            <p className="text-sm text-muted-foreground">Housing Prime Agent</p>
            <a href={`tel:${phoneHref}`} className="text-sm font-black text-navy">
              {phoneHref.slice(0, 8)}...
            </a>
          </div>
        </div>
        <p className="mt-5 text-sm font-extrabold">Please share your contact</p>
        <LeadForm
          property={property}
          onSubmit={addEnquiry}
          onSuccess={() => {
            toast.success("Contact details sent. An advisor will call shortly.");
            setContactOpen(false);
          }}
        />
        {!contactOpen ? (
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="mt-3 w-full text-center text-xs font-semibold text-[#5a25e6]"
          >
            Prefer a scheduled visit?
          </button>
        ) : null}
      </div>
      <div className="rounded-lg bg-card p-5 shadow-[var(--shadow-soft)]">
        <p className="text-sm font-extrabold">Still deciding?</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Shortlist this property now and easily come back to it later.
        </p>
        <button className="mt-4 grid h-12 w-12 place-items-center rounded-full border border-border text-[#ff3d8a] shadow-[var(--shadow-soft)]">
          <Heart className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

interface LeadFormValues {
  name: string;
  phone: string;
  consent: boolean;
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
  const [values, setValues] = useState<LeadFormValues>({ name: "", phone: "", consent: true });
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormValues, string>>>({});
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof LeadFormValues, string>> = {};
    if (values.name.trim().length < 2) nextErrors.name = "Enter your name.";
    if (!/^[0-9+\-\s()]{8,15}$/.test(values.phone)) nextErrors.phone = "Enter a valid phone.";
    if (!values.consent) nextErrors.consent = "Consent is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSending(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        email: "brajsetuproperties@gmail.com",
        phone: values.phone.trim(),
        propertyId: property.id,
        message: `Contact request for ${property.title} (${property.id}) in ${property.location.locality}.`,
      });
      setValues({ name: "", phone: "", consent: true });
      onSuccess();
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-4">
      <div>
        <input
          value={values.name}
          onChange={(event) => {
            setValues((current) => ({ ...current, name: event.target.value }));
            setErrors((current) => ({ ...current, name: undefined }));
          }}
          aria-invalid={Boolean(errors.name)}
          placeholder="Name"
          className="h-11 w-full border-b border-border bg-transparent text-sm outline-none focus:border-[#6d3ff1]"
        />
        {errors.name ? <p className="mt-1 text-xs text-destructive">{errors.name}</p> : null}
      </div>
      <div>
        <div className="flex h-11 items-center gap-2 border-b border-border">
          <span className="text-sm font-bold">+91</span>
          <input
            value={values.phone}
            onChange={(event) => {
              setValues((current) => ({ ...current, phone: event.target.value }));
              setErrors((current) => ({ ...current, phone: undefined }));
            }}
            aria-invalid={Boolean(errors.phone)}
            placeholder="Phone"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        {errors.phone ? <p className="mt-1 text-xs text-destructive">{errors.phone}</p> : null}
      </div>
      <label className="flex items-start gap-2 text-xs leading-5 font-bold">
        <input
          type="checkbox"
          checked={values.consent}
          onChange={(event) => {
            setValues((current) => ({ ...current, consent: event.target.checked }));
            setErrors((current) => ({ ...current, consent: undefined }));
          }}
          className="mt-1 accent-[#6d3ff1]"
        />
        <span>
          I agree to be contacted by Braj Setu Properties via WhatsApp, SMS, phone and email.
        </span>
      </label>
      {errors.consent ? <p className="text-xs text-destructive">{errors.consent}</p> : null}
      <button
        type="submit"
        disabled={sending}
        className="pv-tap flex w-full items-center justify-center gap-2 rounded-md bg-[#10c986] px-5 text-sm font-black text-white disabled:opacity-60"
      >
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageCircle className="h-4 w-4" />
        )}
        {sending ? "Sending..." : "Get Contact Details"}
      </button>
    </form>
  );
}

function HighlightsCard({ property }: { property: Property }) {
  const highlights = [
    `Close to ${property.location.locality} market`,
    "Close to main road connectivity",
    property.specs.bathrooms ? "Well-maintained bathrooms" : "Clear boundary and access",
    property.amenities.includes("Storage") ? "Smart storage available" : "Advisor verified listing",
  ];

  return (
    <section className={cn(sectionCardClass, "p-5 sm:p-6")}>
      <h2 className="text-xl font-extrabold">Special Highlights</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {highlights.map((highlight) => (
          <div key={highlight} className="flex items-center gap-3 text-sm font-medium">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#ff3d7f] text-white">
              <Check className="h-3 w-3" />
            </span>
            {highlight}
          </div>
        ))}
      </div>
    </section>
  );
}

function CommercialStrip({ locality }: { locality: string }) {
  const items = [
    ["Commercial for Rent", "from-navy/15 to-gold/20"],
    ["Offices for Rent", "from-[#ffecf6] to-[#f2dfff]"],
    ["Shops for Rent", "from-[#ffe2ee] to-[#dac9ff]"],
    ["Showrooms for Rent", "from-[#e4fff4] to-[#f7f3ff]"],
  ];

  return (
    <section className={cn(sectionCardClass, "overflow-hidden p-5 sm:p-6")}>
      <h2 className="text-xl font-extrabold">Looking for Options to Invest in Commercial</h2>
      <div className="pv-no-scrollbar mt-5 flex gap-4 overflow-x-auto">
        {items.map(([title, colors]) => (
          <Link
            key={title}
            to="/rent"
            className={cn(
              "h-34 w-40 shrink-0 rounded-md bg-gradient-to-br p-3 shadow-[var(--shadow-soft)]",
              colors,
            )}
          >
            <p className="text-sm font-extrabold">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">in {locality}</p>
            <div className="mt-5 h-12 rounded bg-white/55" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function TourPhotos({
  photos,
  onOpen,
}: {
  photos: GalleryPhoto[];
  onOpen: (index: number) => void;
}) {
  return (
    <section className={cn(sectionCardClass, "p-5 sm:p-6")}>
      <h2 className="text-xl font-extrabold">Tour this Property: Images & Videos</h2>
      <p className="mt-5 text-lg font-medium">Property Photos & Videos</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {photos.slice(0, 4).map((photo, index) => (
          <button
            key={`${photo.label}-${index}`}
            type="button"
            onClick={() => onOpen(index)}
            className="relative overflow-hidden rounded-md"
          >
            <SmartImage src={photo.src} alt={`${photo.label} photo`} aspect="aspect-[16/10]" />
            {index === 3 ? (
              <span className="absolute inset-0 grid place-items-center bg-black/45 text-2xl font-black text-white">
                +{Math.max(photos.length - 4, 1)}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
}

function ReviewPills({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: LucideIcon;
  items: string[];
}) {
  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-extrabold">
        <Icon className="h-4 w-4 text-[#ff0d78]" />
        {title}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-md bg-smoke px-3 py-2 text-xs font-medium text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function FeatureTile({
  icon: Icon,
  title,
  value,
}: {
  icon: LucideIcon;
  title: string;
  value?: string;
}) {
  return (
    <div className="min-h-20 rounded-md border border-border p-4">
      <Icon className="h-5 w-5 text-navy" />
      <p className="mt-4 text-sm text-navy">
        {value ? <span className="font-black">{value} </span> : null}
        {title}
      </p>
    </div>
  );
}

function IconButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full text-[#6d3ff1] hover:bg-[#f1ecff]",
        active && "text-[#ff3d8a]",
      )}
    >
      <Icon className={cn("h-5 w-5", active && "fill-current")} />
    </button>
  );
}

function ActionPill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-xs font-black text-navy uppercase shadow-[var(--shadow-soft)]">
      <Icon className="h-4 w-4 text-[#6d3ff1]" />
      {label}
    </span>
  );
}

function ImageLabel({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <span
      className={cn(
        "absolute top-3 left-3 rounded-sm px-2 py-1 text-xs font-bold",
        dark ? "top-auto bottom-4 bg-black/60 text-white" : "bg-white/85 text-navy",
      )}
    >
      {label}
    </span>
  );
}

function scrollToSection(id: SectionId) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function jumpToCategory(
  photos: GalleryPhoto[],
  category: GalleryCategory,
  onSelect: (index: number) => void,
) {
  const next = photos.findIndex((photo) => photo.label === category);
  if (next >= 0) onSelect(next);
}

function buildGalleryPhotos(property: Property): GalleryPhoto[] {
  const fallbackLabels: PropertyImageLabel[] = [
    "Main",
    "Bedroom",
    "Kitchen",
    "Bathroom",
    "Balcony",
    "Bedroom",
    "Kitchen",
  ];

  if (property.images.length) {
    return property.images.map((image, index) =>
      normalizePropertyImage(image, fallbackLabels[index % fallbackLabels.length]),
    );
  }

  return [{ src: "", label: "Main" }];
}

function buildAmenities(property: Property): { label: string; icon: LucideIcon }[] {
  const base: { label: string; icon: LucideIcon }[] = [
    { label: "AC", icon: AirVent },
    { label: "Geyser", icon: Zap },
    { label: "Lift", icon: Home },
    { label: "Power Backup", icon: ShieldCheck },
    { label: "CCTV", icon: Camera },
    { label: "Attached Balcony", icon: Trees },
  ];

  const fromProperty = property.amenities.map((label) => ({
    label,
    icon:
      label.includes("Garden") || label.includes("Backyard")
        ? Trees
        : label.includes("Gym")
          ? Sparkles
          : ShieldCheck,
  }));

  return [...base, ...fromProperty].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.label === item.label) === index,
  );
}

function formatDisplayPrice(value: number, intent?: Property["intent"]): string {
  return formatPrice(value, intent).replace("\u20b9", "Rs. ");
}
