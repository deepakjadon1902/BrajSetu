import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, Maximize } from "lucide-react";
import { SmartImage } from "@/components/SmartImage";
import { formatArea, formatPrice } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
  variant?: "standard" | "compact" | "featured";
  active?: boolean;
  onSelect?: (property: Property) => void;
}

function MetaRow({ property, className }: { property: Property; className?: string }) {
  const items = [
    property.specs.bedrooms ? { icon: BedDouble, label: `${property.specs.bedrooms} Beds` } : null,
    property.specs.bathrooms ? { icon: Bath, label: `${property.specs.bathrooms} Baths` } : null,
    { icon: Maximize, label: formatArea(property.specs.area) },
  ].filter(Boolean) as { icon: typeof Bath; label: string }[];

  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {items.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
        >
          <Icon className="h-3.5 w-3.5 text-navy-soft/70" />
          {label}
        </span>
      ))}
    </div>
  );
}

export function PropertyCard({
  property,
  variant = "standard",
  active = false,
  onSelect,
}: PropertyCardProps) {
  const badge = (
    <span className="absolute top-3 left-3 rounded-full bg-navy/85 px-3 py-1 text-[11px] font-semibold text-background backdrop-blur-sm">
      {property.category} · {property.intent}
    </span>
  );

  if (variant === "compact") {
    return (
      <article
        onClick={() => onSelect?.(property)}
        className={cn(
          "group flex cursor-pointer gap-4 rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
          active && "ring-2 ring-gold",
        )}
      >
        <SmartImage
          src={property.images[0] ?? ""}
          alt={property.title}
          aspect="aspect-square"
          wrapperClassName="w-28 shrink-0 rounded-xl sm:w-36"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-base font-extrabold text-gold-deep">
              {formatPrice(property.price, property.intent)}
            </p>
            <Link
              to="/property/$propertyId"
              params={{ propertyId: property.id }}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 text-xs font-semibold text-navy underline-offset-4 hover:underline"
            >
              View Details
            </Link>
          </div>
          <h3 className="mt-1 truncate text-sm font-bold text-navy">{property.title}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {property.location.locality}, {property.location.city}
          </p>
          <MetaRow property={property} className="mt-2" />
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "pv-lift group overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-soft)]",
        variant === "featured" && "ring-1 ring-gold/40",
      )}
    >
      <Link to="/property/$propertyId" params={{ propertyId: property.id }} className="block">
        <div className="relative">
          <SmartImage src={property.images[0] ?? ""} alt={property.title} />
          {badge}
          {property.status && (
            <span className="absolute top-3 right-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold text-navy">
              {property.status}
            </span>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 flex-1 truncate text-base font-bold text-navy">
              {property.title}
            </h3>
            <p className="shrink-0 text-base font-extrabold text-gold-deep">
              {formatPrice(property.price, property.intent)}
            </p>
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {property.location.locality}, {property.location.city}
          </p>
          <MetaRow property={property} className="mt-4 border-t border-border pt-4" />
        </div>
      </Link>
    </article>
  );
}
