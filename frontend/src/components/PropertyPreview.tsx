import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { MapPlaceholder } from "@/components/MapPlaceholder";
import { SmartImage } from "@/components/SmartImage";
import { formatArea, formatPrice } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Property } from "@/types/property";

const tabs = ["Overview", "Reviews", "Details"] as const;

interface PropertyPreviewProps {
  property: Property;
  onClose?: () => void;
  className?: string;
}

export function PropertyPreview({ property, onClose, className }: PropertyPreviewProps) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");

  return (
    <aside
      className={cn("overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-lift)]", className)}
    >
      <div className="relative">
        <SmartImage src={property.images[0] ?? ""} alt={property.title} aspect="aspect-[16/9]" />
        <span className="absolute top-3 left-3 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-primary-foreground">
          {property.status ?? "Active"}
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 text-navy"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-extrabold text-navy">{property.title}</h3>
            <p className="truncate text-sm text-muted-foreground">
              {property.location.locality}, {property.location.city}
            </p>
          </div>
          <p className="shrink-0 text-lg font-extrabold text-gold-deep">
            {formatPrice(property.price, property.intent)}
          </p>
        </div>

        <div className="mt-4 flex gap-1 rounded-full bg-ice p-1">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "pv-smooth-state flex-1 rounded-full px-3 py-2 text-xs font-semibold",
                tab === t ? "bg-navy text-background" : "text-navy-soft hover:text-navy",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4 min-h-24 text-sm leading-relaxed text-muted-foreground">
          {tab === "Overview" && <p>{property.description}</p>}
          {tab === "Reviews" && (
            <p>
              Rated 4.8/5 by 12 visitors. Buyers consistently mention the natural light, the quality
              of the finishing and how quiet the street is after 8pm.
            </p>
          )}
          {tab === "Details" && (
            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs text-muted-foreground">Category</dt>
                <dd className="text-sm font-semibold text-navy">{property.category}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Intent</dt>
                <dd className="text-sm font-semibold text-navy">{property.intent}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Area</dt>
                <dd className="text-sm font-semibold text-navy">
                  {formatArea(property.specs.area)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Furnishing</dt>
                <dd className="text-sm font-semibold text-navy">
                  {property.specs.furnishing ?? "—"}
                </dd>
              </div>
            </dl>
          )}
        </div>

        <MapPlaceholder
          compact
          className="mt-5"
          pins={[{ id: property.id, label: property.location.locality, x: 48, y: 58 }]}
        />

        <Link
          to="/property/$propertyId"
          params={{ propertyId: property.id }}
          className="pv-smooth-state pv-tap mt-5 flex w-full items-center justify-center rounded-full bg-navy text-sm font-semibold text-background hover:scale-[1.01]"
        >
          View full listing
        </Link>
      </div>
    </aside>
  );
}
