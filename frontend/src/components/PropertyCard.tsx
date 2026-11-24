import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Bath, BedDouble, Camera, MapPin, Maximize } from "lucide-react";
import { SmartImage } from "@/components/SmartImage";
import { VerificationBadge } from "@/components/VerificationBadge";
import { formatArea, formatPrice } from "@/lib/api";
import { getCoverPhotoIndex, getPhotoName, getPropertyPhotos } from "@/lib/property-images";
import { cn } from "@/lib/utils";
import type { Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
  variant?: "standard" | "compact" | "featured";
  active?: boolean;
  onSelect?: (property: Property) => void;
}

function MetaRow({ property }: { property: Property }) {
  const { bedrooms, bathrooms, area } = property.specs;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-5 text-navy-soft">
      {area > 0 && (
        <span className="inline-flex items-center gap-1.5">
          <Maximize className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          {formatArea(area, property.propertyDetails?.areaUnit)}
        </span>
      )}
      {!!bedrooms && (
        <span className="inline-flex items-center gap-1.5">
          <BedDouble className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          {bedrooms} {bedrooms === 1 ? "bed" : "beds"}
        </span>
      )}
      {!!bathrooms && (
        <span className="inline-flex items-center gap-1.5">
          <Bath className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          {bathrooms} {bathrooms === 1 ? "bath" : "baths"}
        </span>
      )}
    </div>
  );
}

export function PropertyCard({
  property,
  variant = "standard",
  active = false,
}: PropertyCardProps) {
  const compact = variant === "compact";
  const photos = getPropertyPhotos(property.images);
  const coverIndex = getCoverPhotoIndex(photos);
  const cover = photos[coverIndex];
  const totalPhotos = property.photoCount ?? photos.length;
  const additionalDetails = [
    property.specs.furnishing?.trim(),
    property.propertyDetails?.availability?.trim(),
  ].filter(Boolean);

  return (
    <article
      className={cn(
        "group min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition-[border-color,box-shadow,transform] duration-300 hover:border-navy/25 hover:shadow-[var(--shadow-lift)] motion-safe:hover:-translate-y-0.5",
        active && "ring-2 ring-navy",
        variant === "featured" && "border-gold/50",
      )}
    >
      <Link
        to="/property/$propertyId"
        params={{ propertyId: property.id }}
        className={cn(
          "flex h-full min-w-0 flex-col focus-visible:outline-offset-[-3px]",
          compact && "sm:flex-row",
        )}
      >
        <div
          className={cn(
            "relative min-w-0 overflow-hidden border-b border-border bg-smoke",
            compact && "sm:w-[32%] sm:max-w-56 sm:shrink-0 sm:border-b-0 sm:border-r",
          )}
        >
          <SmartImage
            src={cover?.src ?? ""}
            alt={cover ? `${property.title} — ${getPhotoName(cover, coverIndex)}` : ""}
            aspect="aspect-[4/3]"
            wrapperClassName={cn("bg-smoke", compact && "sm:aspect-auto sm:h-full sm:min-h-44")}
            className="absolute inset-0 h-full w-full object-cover object-center transition-[transform,opacity] duration-300 motion-safe:group-hover:scale-[1.035]"
          />
          {totalPhotos > 1 && (
            <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-[#10192a]/80 px-2.5 py-1 text-xs font-medium text-white">
              <Camera className="size-3.5" aria-hidden="true" /> {totalPhotos} photos
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] leading-4 text-muted-foreground">
            <span>
              {property.category} · {property.intent === "Rent" ? "For rent" : "For sale"}
            </span>
            {(property.status === "New" || property.status === "Price Drop") && (
              <span className="font-medium text-gold-deep">{property.status}</span>
            )}
          </div>
          <p className="mt-1 text-lg font-semibold leading-6 tracking-tight text-navy">
            {formatPrice(property.price, property.intent)}
          </p>
          <h3 className="mt-1 break-words text-[0.9375rem] font-semibold leading-6 text-navy [text-wrap:pretty]">
            {property.title}
          </h3>
          <p className="mt-1 flex items-start gap-1.5 text-xs leading-[1.125rem] text-muted-foreground">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words">
              {property.location.locality}, {property.location.city}
            </span>
          </p>
          <MetaRow property={property} />
          {additionalDetails.length > 0 && (
            <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
              {additionalDetails.join(" · ")}
            </p>
          )}
          <div className="mt-auto pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
              <VerificationBadge
                property={property}
                compact
                className="gap-1.5 px-2 py-0.5 text-[10px] font-medium [&_svg]:h-3 [&_svg]:w-3"
              />
              <span className="inline-flex items-center gap-1 text-xs font-semibold leading-5 text-navy">
                View details{" "}
                <ArrowUpRight
                  className="size-3.5 transition-transform motion-safe:group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
