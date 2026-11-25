import { useId, useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Loader2, MapPin, Share2 } from "lucide-react";
import { toast } from "sonner";
import { ContactActions } from "@/components/ContactActions";
import { MapPlaceholder } from "@/components/MapPlaceholder";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyGallery } from "@/components/PropertyGallery";
import { EmptyState, PropertyCardSkeleton } from "@/components/States";
import { VerificationBadge } from "@/components/VerificationBadge";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { inputClass } from "@/components/auth/AuthLayout";
import { findProperty, formatArea, formatPrice, similarProperties } from "@/lib/api";
import { getPropertyPhotos } from "@/lib/property-images";
import { API_BASE, useStore } from "@/lib/mock-store";
import { useSavedProperties } from "@/lib/saved-properties";
import { verifiedListingDisclaimer } from "@/lib/verification";
import { cn } from "@/lib/utils";
import type { Property } from "@/types/property";

export const Route = createFileRoute("/property/$propertyId")({
  loader: async ({ params }) => {
    try {
      const response = await fetch(
        API_BASE + "/properties/" + encodeURIComponent(params.propertyId),
        { signal: AbortSignal.timeout(12000) },
      );
      if (!response.ok) return { property: null };
      const data = (await response.json()) as { property?: Property };
      return { property: data.property ?? null };
    } catch {
      return { property: null };
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.property
      ? [
          { title: loaderData.property.title + " | Braj Setu Properties" },
          {
            name: "description",
            content:
              loaderData.property.category +
              " for " +
              loaderData.property.intent.toLowerCase() +
              " in " +
              loaderData.property.location.locality +
              ", " +
              loaderData.property.location.city +
              ".",
          },
        ]
      : [
          { title: "Listing unavailable | Braj Setu Properties" },
          { name: "robots", content: "noindex" },
        ],
  }),
  component: PropertyDetailPage,
});

function PropertyDetailPage() {
  const { propertyId } = Route.useParams();
  const { property: loaderProperty } = Route.useLoaderData();
  const { properties, hydrated } = useStore();
  const { savedIds, toggleSaved } = useSavedProperties();
  const [contactOpen, setContactOpen] = useState(false);
  const property = loaderProperty ?? findProperty(properties, propertyId);
  const photos = useMemo(() => getPropertyPhotos(property?.images), [property]);

  async function shareProperty() {
    try {
      if (navigator.share)
        await navigator.share({
          title: property?.title ?? "Braj Setu property",
          url: window.location.href,
        });
      else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Property link copied.");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        toast.error("Could not share the link. Copy the address from your browser.");
    }
  }

  if (!property) {
    return (
      <div className="pv-container py-12">
        {!hydrated ? (
          <PropertyCardSkeleton />
        ) : (
          <EmptyState
            title="This listing is unavailable"
            description="The property may have been removed or could not be loaded. Browse the current listings or contact our team."
            action={
              <Link to="/buy" search={{ q: undefined }} className="pv-button-primary">
                Browse properties
              </Link>
            }
          />
        )}
      </div>
    );
  }
  const price = formatPrice(property.price, property.intent);
  const details = property.propertyDetails ?? {};
  const similar = similarProperties(properties, property.id, 3);
  const saved = savedIds.includes(property.id);
  const facts = [
    ["Property type", property.category],
    ["Area", formatArea(property.specs.area, details.areaUnit)],
    ["Bedrooms", property.specs.bedrooms ? String(property.specs.bedrooms) : ""],
    ["Bathrooms", property.specs.bathrooms ? String(property.specs.bathrooms) : ""],
    ["Furnishing", property.specs.furnishing],
    ["Availability", details.availability],
    ["Address", details.fullAddress],
    ["Landmark", details.landmark],
    ["Plot area", details.plotArea ? formatArea(details.plotArea, details.areaUnit) : ""],
    ["Carpet area", details.carpetArea ? formatArea(details.carpetArea, details.areaUnit) : ""],
    ["Built-up area", details.builtUpArea ? formatArea(details.builtUpArea, details.areaUnit) : ""],
    [
      "Floor",
      [details.floor, details.totalFloors ? "of " + details.totalFloors : ""]
        .filter(Boolean)
        .join(" "),
    ],
    ["Balconies", details.balconies ? String(details.balconies) : ""],
    ["Parking", details.parking],
    ["Facing", details.facing],
    ["Road width", details.roadWidth],
    ["Water supply", details.waterSupply],
    ["Power backup", details.powerBackup],
    ["Lease or ownership", details.leaseType || property.ownershipType],
    [
      "Price negotiable",
      details.priceNegotiable === undefined ? "" : details.priceNegotiable ? "Yes" : "No",
    ],
    [
      "Gated community",
      details.gatedCommunity === undefined ? "" : details.gatedCommunity ? "Yes" : "No",
    ],
    ["Gas pipeline", details.gasPipeline === undefined ? "" : details.gasPipeline ? "Yes" : "No"],
  ].filter(([, value]) => value);
  const furnishings = [
    ["Fans", details.fans],
    ["Lights", details.lights],
    ["Wardrobes", details.wardrobes],
    ["Air conditioners", details.acs],
    ["Beds", details.beds],
    ["Geysers", details.geysers],
  ].filter(([, value]) => typeof value === "number" && value > 0);
  const sectionClass = "pv-panel scroll-mt-6 p-4 sm:p-7";

  return (
    <div className="bg-smoke pb-24 lg:pb-12">
      <div className="pv-page-intro border-b border-border">
        <div className="pv-container pt-4 pb-5 sm:pt-5 sm:pb-6">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
          >
            <Link to="/" className="pv-tap inline-flex items-center hover:text-navy">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              to={property.intent === "Rent" ? "/rent" : "/buy"}
              search={{ q: undefined }}
              className="pv-tap inline-flex items-center hover:text-navy"
            >
              {property.intent === "Rent" ? "Rent" : "Buy"}
            </Link>
            <span aria-hidden="true">/</span>
            <span>{property.location.city}</span>
          </nav>
          <div className="mt-3 grid items-end gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 max-w-3xl">
              <h1 className="pv-heading max-w-[25ch]">{property.title}</h1>
              <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {property.location.locality}, {property.location.city}
              </p>
              <div className="mt-3">
                <VerificationBadge property={property} />
              </div>
            </div>
            <div className="lg:text-right">
              <p className="text-[clamp(1.55rem,1.3rem+1vw,2.35rem)] font-semibold tracking-tight text-navy">
                {price}
              </p>
              <div className="mt-3 flex gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={() => void shareProperty()}
                  className="pv-button-secondary gap-2 px-3"
                >
                  <Share2 className="h-4 w-4" /> Share
                </button>
                <button
                  type="button"
                  aria-pressed={saved}
                  onClick={() => toggleSaved(property.id)}
                  className="pv-button-secondary gap-2 px-3"
                >
                  <Heart className={cn("h-4 w-4", saved && "fill-navy")} />
                  {saved ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          </div>
          <nav
            aria-label="Property sections"
            className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-0.5 border-t border-border sm:mt-5 sm:gap-x-6"
          >
            {[
              ["Photos", "#property-photos"],
              ["Overview", "#overview"],
              ["Amenities", "#property-amenities"],
              ["Location", "#property-location"],
            ].map(([label, target]) => (
              <a
                key={target}
                href={target}
                className="pv-tap inline-flex items-center text-sm font-medium text-navy hover:underline hover:underline-offset-4"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>
      <div className="pv-container mt-5 grid items-start gap-6 lg:mt-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
        <div className="min-w-0 space-y-5">
          <div id="property-photos" className="scroll-mt-6">
            <PropertyGallery key={propertyId} title={property.title} photos={photos} />
          </div>
          <section id="overview" className={sectionClass}>
            <h2 className="text-xl font-semibold text-navy">About this property</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {property.description || "Contact our team for more information about this listing."}
            </p>
            <dl className="mt-6 grid gap-x-4 gap-y-5 border-t border-border pt-5 min-[360px]:grid-cols-2 sm:gap-x-6">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 break-words text-sm font-medium text-navy">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          {!!details.highlights?.length && (
            <section className={sectionClass}>
              <h2 className="text-xl font-semibold text-navy">Highlights</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {details.highlights.filter(Boolean).map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </section>
          )}
          <section id="property-amenities" className={sectionClass}>
            <h2 className="text-xl font-semibold text-navy">Amenities and furnishings</h2>
            {property.amenities.length || furnishings.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-lg border border-border bg-smoke px-3 py-2 text-sm text-navy"
                  >
                    {amenity}
                  </span>
                ))}
                {furnishings.map(([label, value]) => (
                  <span
                    key={label}
                    className="rounded-lg border border-border bg-smoke px-3 py-2 text-sm text-navy"
                  >
                    {value} {label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Amenities have not been added. Ask our team for details.
              </p>
            )}
          </section>
          <section className={sectionClass}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-navy">Listing checks</h2>
              <VerificationBadge property={property} compact />
            </div>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {property.verification?.scope || verifiedListingDisclaimer}
            </p>
            <p className="mt-4 break-all text-xs text-muted-foreground">
              Listing ID: {property.id}
            </p>
            {property.rera?.providedNumber && (
              <div className="mt-4 rounded-lg border border-border bg-smoke p-4">
                <p className="text-sm font-medium text-navy">
                  RERA number: {property.rera.providedNumber}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {property.rera.status === "CHECKED"
                    ? "Recorded as checked by our team."
                    : "Provided by the listing contact; not independently checked."}
                </p>
                <a
                  href="https://www.up-rera.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pv-tap mt-2 inline-flex items-center text-sm text-navy underline underline-offset-4"
                >
                  Check the official UP RERA register
                </a>
              </div>
            )}
          </section>
          <section id="property-location" className={sectionClass}>
            <h2 className="text-xl font-semibold text-navy">Explore the location</h2>
            <MapPlaceholder
              className="mt-5"
              pins={[
                {
                  id: property.id,
                  label: property.location.locality + ", " + property.location.city,
                  x: 0,
                  y: 0,
                },
              ]}
            />
          </section>
          <ReportPropertyCard property={property} />
        </div>
        <aside className="pv-panel hidden p-5 lg:sticky lg:top-24 lg:block">
          <h2 className="text-lg font-semibold text-navy">Interested in this property?</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Ask a question or request a visit. Our team will follow up with you.
          </p>
          <EnquiryForm property={property} />
          <div className="mt-6 border-t border-border pt-5">
            <ContactActions />
          </div>
        </aside>
      </div>
      {similar.length > 0 && (
        <section className="pv-container mt-10">
          <h2 className="pv-heading">More properties to explore</h2>
          <div className="pv-property-grid mt-6">
            {similar.map((item) => (
              <PropertyCard
                key={item.id}
                property={item}
                saved={savedIds.includes(item.id)}
                onToggleSaved={toggleSaved}
              />
            ))}
          </div>
        </section>
      )}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <p className="min-w-0 break-words text-base font-semibold text-navy">{price}</p>
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="pv-button-primary shrink-0"
            aria-label="Enquire or request a visit"
          >
            Enquire
          </button>
        </div>
      </div>
      <Sheet open={contactOpen} onOpenChange={setContactOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto max-w-lg">
            <SheetTitle className="pr-8">Ask about this property</SheetTitle>
            <SheetDescription className="mt-2">{property.title}</SheetDescription>
            <EnquiryForm property={property} onSuccess={() => setContactOpen(false)} />
            <div className="mt-6">
              <ContactActions layout="row" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function EnquiryForm({ property, onSuccess }: { property: Property; onSuccess?: () => void }) {
  const { addEnquiry, currentUser } = useStore();
  const id = useId();
  const [values, setValues] = useState({
    name: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    phone: currentUser?.phone ?? "",
    consent: false,
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!values.consent) {
      setError("Please allow our team to contact you about this enquiry.");
      return;
    }
    setError("");
    setSending(true);
    try {
      await addEnquiry({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        message: "Enquiry or visit request for " + property.title + " (" + property.id + ").",
        propertyId: property.id,
      });
      setSent(true);
      toast.success("Your enquiry has been sent.");
      onSuccess?.();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Your enquiry could not be sent. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }
  return (
    <form onSubmit={submit} className="mt-5 space-y-4">
      {(["name", "email", "phone"] as const).map((key) => (
        <div key={key}>
          <label htmlFor={id + key} className="text-sm font-medium text-navy">
            {key === "name" ? "Full name" : key === "email" ? "Email address" : "Phone number"}
          </label>
          <input
            id={id + key}
            type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
            autoComplete={key === "phone" ? "tel" : key}
            required
            minLength={key === "name" ? 2 : key === "phone" ? 8 : undefined}
            value={values[key]}
            onChange={(event) => setValues({ ...values, [key]: event.target.value })}
            className={cn(inputClass, "mt-2")}
          />
        </div>
      ))}
      <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
        <input
          type="checkbox"
          checked={values.consent}
          onChange={(event) => setValues({ ...values, consent: event.target.checked })}
          className="mt-0.5 h-5 w-5 shrink-0 accent-navy"
        />
        <span>
          I agree to be contacted about this property. See our{" "}
          <Link to="/privacy" className="underline underline-offset-4">
            privacy policy
          </Link>
          .
        </span>
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {sent && (
        <p role="status" className="text-sm text-navy">
          Thank you. Your enquiry is with our team.
        </p>
      )}
      <button type="submit" disabled={sending} className="pv-button-primary w-full gap-2">
        {sending && <Loader2 className="h-4 w-4 animate-spin" />}
        {sending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}

type ReportCategory =
  | "fake_property"
  | "wrong_owner"
  | "misleading_price"
  | "duplicate_listing"
  | "document_concern"
  | "other";
function ReportPropertyCard({ property }: { property: Property }) {
  const { reportProperty } = useStore();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({
    reporterName: "",
    reporterEmail: "",
    reporterPhone: "",
    category: "other" as ReportCategory,
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = await reportProperty({ propertyId: property.id, ...values });
      toast.success("Report received. Ticket " + result.ticketNumber);
      setOpen(false);
      setValues({
        reporterName: "",
        reporterEmail: "",
        reporterPhone: "",
        category: "other",
        message: "",
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your report could not be sent.");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-navy">See something that needs a check?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell our team about incorrect information or a concern.
          </p>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id + "report"}
          onClick={() => setOpen(!open)}
          className="pv-button-secondary"
        >
          {open ? "Close report" : "Report listing"}
        </button>
      </div>
      {open && (
        <form id={id + "report"} onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
          {(
            [
              { key: "reporterName", label: "Your name", type: "text" },
              { key: "reporterEmail", label: "Email address", type: "email" },
              { key: "reporterPhone", label: "Phone number", type: "tel" },
            ] as const
          ).map(({ key, label, type }) => (
            <div key={key}>
              <label htmlFor={id + key} className="text-sm font-medium text-navy">
                {label}
              </label>
              <input
                id={id + key}
                type={type}
                required
                minLength={key === "reporterName" ? 2 : key === "reporterPhone" ? 8 : undefined}
                value={values[key]}
                onChange={(event) => setValues({ ...values, [key]: event.target.value })}
                className={cn(inputClass, "mt-2")}
              />
            </div>
          ))}
          <div>
            <label htmlFor={id + "reason"} className="text-sm font-medium text-navy">
              Reason
            </label>
            <select
              id={id + "reason"}
              value={values.category}
              onChange={(event) =>
                setValues({ ...values, category: event.target.value as ReportCategory })
              }
              className={cn(inputClass, "mt-2")}
            >
              <option value="fake_property">Property authenticity</option>
              <option value="wrong_owner">Owner or authority details</option>
              <option value="misleading_price">Price information</option>
              <option value="duplicate_listing">Duplicate listing</option>
              <option value="document_concern">Document concern</option>
              <option value="other">Other concern</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={id + "message"} className="text-sm font-medium text-navy">
              Describe your concern
            </label>
            <textarea
              id={id + "message"}
              required
              minLength={20}
              rows={4}
              value={values.message}
              onChange={(event) => setValues({ ...values, message: event.target.value })}
              className={cn(inputClass, "mt-2 resize-y")}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Include at least 20 characters. Our team will use these details to review your report.{" "}
              <Link to="/privacy" className="underline">
                Privacy policy
              </Link>
            </p>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive sm:col-span-2">
              {error}
            </p>
          )}
          <button type="submit" disabled={submitting} className="pv-button-primary sm:w-fit">
            {submitting ? "Submitting…" : "Submit report"}
          </button>
        </form>
      )}
    </section>
  );
}
