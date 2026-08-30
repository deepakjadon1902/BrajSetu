import { Bath, BedDouble, Building2, Home, Landmark, Store, Trees } from "lucide-react";
import { AMENITY_OPTIONS } from "@/data/properties";
import { PRICE_BOUNDS, formatPrice } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { PropertyCategory, PropertyFilters } from "@/types/property";

const categories: { value: PropertyCategory; icon: typeof Home }[] = [
  { value: "House", icon: Home },
  { value: "Flat", icon: Building2 },
  { value: "Shop", icon: Store },
  { value: "Plot", icon: Landmark },
  { value: "Farm House", icon: Trees },
];

interface FilterPanelProps {
  filters: PropertyFilters;
  onChange: (next: PropertyFilters) => void;
  onApply?: () => void;
  className?: string;
}

function Counter({
  label,
  icon: Icon,
  value,
  onChange,
}: {
  label: string;
  icon: typeof Bath;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-sm font-medium text-navy">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </span>
      <div className="flex items-center gap-1 rounded-full border border-border p-1">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="pv-smooth-state h-9 w-9 rounded-full text-navy hover:bg-ice"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold text-navy">
          {value === 0 ? "Any" : `${value}+`}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(Math.min(6, value + 1))}
          className="pv-smooth-state h-9 w-9 rounded-full text-navy hover:bg-ice"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function FilterPanel({ filters, onChange, onApply, className }: FilterPanelProps) {
  const selectedCategories = filters.categories ?? [];
  const selectedAmenities = filters.amenities ?? [];
  const maxPrice = filters.maxPrice ?? PRICE_BOUNDS.max;
  const minPrice = filters.minPrice ?? PRICE_BOUNDS.min;

  function toggleCategory(value: PropertyCategory) {
    const next = selectedCategories.includes(value)
      ? selectedCategories.filter((c) => c !== value)
      : [...selectedCategories, value];
    onChange({ ...filters, categories: next });
  }

  function toggleAmenity(value: string) {
    const next = selectedAmenities.includes(value)
      ? selectedAmenities.filter((a) => a !== value)
      : [...selectedAmenities, value];
    onChange({ ...filters, amenities: next });
  }

  return (
    <div className={cn("flex h-full flex-col rounded-2xl bg-card", className)}>
      <div className="flex-1 space-y-7 overflow-y-auto p-5">
        <div>
          <label
            htmlFor="filter-location"
            className="text-xs font-semibold tracking-wide text-navy uppercase"
          >
            Location
          </label>
          <input
            id="filter-location"
            value={filters.city ?? ""}
            onChange={(e) => onChange({ ...filters, city: e.target.value })}
            placeholder="City or locality"
            className="pv-smooth-state mt-2 min-h-11 w-full rounded-full border border-border bg-background px-4 text-sm text-navy outline-none focus:border-gold"
          />
        </div>

        <div>
          <p className="text-xs font-semibold tracking-wide text-navy uppercase">Price range</p>
          <div className="mt-3 space-y-3">
            <input
              type="range"
              aria-label="Minimum price"
              min={PRICE_BOUNDS.min}
              max={PRICE_BOUNDS.max}
              step={100000}
              value={minPrice}
              onChange={(e) =>
                onChange({
                  ...filters,
                  minPrice: Math.min(Number(e.target.value), maxPrice),
                })
              }
              className="w-full accent-[var(--gold)]"
            />
            <input
              type="range"
              aria-label="Maximum price"
              min={PRICE_BOUNDS.min}
              max={PRICE_BOUNDS.max}
              step={100000}
              value={maxPrice}
              onChange={(e) =>
                onChange({
                  ...filters,
                  maxPrice: Math.max(Number(e.target.value), minPrice),
                })
              }
              className="w-full accent-[var(--gold)]"
            />
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>{formatPrice(minPrice)}</span>
              <span>{formatPrice(maxPrice)}</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-wide text-navy uppercase">Property type</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {categories.map(({ value, icon: Icon }) => {
              const active = selectedCategories.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleCategory(value)}
                  className={cn(
                    "pv-smooth-state pv-tap flex items-center gap-2 rounded-xl border px-3 text-xs font-semibold",
                    active
                      ? "border-navy bg-navy text-background"
                      : "border-border text-navy hover:border-navy/40",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{value}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <Counter
            label="Bedrooms"
            icon={BedDouble}
            value={filters.bedrooms ?? 0}
            onChange={(v) => onChange({ ...filters, bedrooms: v || undefined })}
          />
          <Counter
            label="Bathrooms"
            icon={Bath}
            value={filters.bathrooms ?? 0}
            onChange={(v) => onChange({ ...filters, bathrooms: v || undefined })}
          />
        </div>

        <div>
          <p className="text-xs font-semibold tracking-wide text-navy uppercase">Amenities</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map((amenity) => {
              const active = selectedAmenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleAmenity(amenity)}
                  className={cn(
                    "pv-smooth-state rounded-full border px-4 py-2.5 text-xs font-medium",
                    active
                      ? "border-gold bg-gold text-primary-foreground"
                      : "border-border text-navy-soft hover:border-navy/40",
                  )}
                >
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-border p-4">
        <button
          type="button"
          onClick={onApply}
          className="pv-smooth-state pv-tap w-full rounded-full bg-gold text-sm font-semibold text-primary-foreground hover:scale-[1.01]"
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}
