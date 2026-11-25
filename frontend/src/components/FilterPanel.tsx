import { Bath, BedDouble, Building2, Home, Landmark, Store, Trees } from "lucide-react";
import { useId } from "react";
import { AMENITY_OPTIONS } from "@/data/properties";
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
  onReset?: () => void;
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
          className="pv-smooth-state h-11 w-11 rounded-lg text-navy hover:bg-ice disabled:opacity-40"
          disabled={value === 0}
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
          className="pv-smooth-state h-11 w-11 rounded-lg text-navy hover:bg-ice disabled:opacity-40"
          disabled={value === 6}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function FilterPanel({ filters, onChange, onApply, onReset, className }: FilterPanelProps) {
  const locationId = useId();
  const selectedCategories = filters.categories ?? [];
  const selectedAmenities = filters.amenities ?? [];
  const minPrice = filters.minPrice ?? 0;

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
    <div className={cn("flex flex-col overflow-hidden rounded-xl bg-card", className)}>
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-b border-border px-5 py-2",
          onApply && "pr-16",
        )}
      >
        <h2 className="text-base font-semibold text-navy">Filters</h2>
        <button
          type="button"
          onClick={() => (onReset ? onReset() : onChange({ intent: filters.intent }))}
          className="pv-tap text-xs font-medium text-muted-foreground underline underline-offset-4"
        >
          Reset
        </button>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain p-5">
        <div>
          <label
            htmlFor={locationId}
            className="text-xs font-semibold tracking-wide text-navy uppercase"
          >
            Location
          </label>
          <input
            id={locationId}
            value={filters.city ?? ""}
            onChange={(e) => onChange({ ...filters, city: e.target.value })}
            placeholder="City or locality"
            className="pv-smooth-state mt-2 min-h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-navy focus:border-navy"
          />
        </div>

        <div>
          <p className="text-xs font-semibold tracking-wide text-navy uppercase">Price range</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-xs text-muted-foreground">
              Minimum (₹)
              <input
                type="number"
                min={0}
                inputMode="numeric"
                step={filters.intent === "Rent" ? 1000 : 100000}
                value={filters.minPrice ?? ""}
                placeholder="Any"
                onChange={(e) =>
                  onChange({
                    ...filters,
                    minPrice: e.target.value ? Math.max(0, Number(e.target.value)) : undefined,
                    maxPrice:
                      filters.maxPrice && Number(e.target.value) > filters.maxPrice
                        ? Number(e.target.value)
                        : filters.maxPrice,
                  })
                }
                className="mt-2 min-h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-navy"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Maximum (₹)
              <input
                type="number"
                min={minPrice}
                inputMode="numeric"
                step={filters.intent === "Rent" ? 1000 : 100000}
                value={filters.maxPrice ?? ""}
                placeholder="Any"
                onChange={(e) =>
                  onChange({
                    ...filters,
                    maxPrice: e.target.value
                      ? Math.max(Number(e.target.value), minPrice)
                      : undefined,
                  })
                }
                className="mt-2 min-h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-navy"
              />
            </label>
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
                    "pv-smooth-state pv-tap rounded-lg border px-3 py-2 text-xs font-medium",
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

      {onApply && (
        <div className="border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={onApply} className="pv-button-primary w-full">
            Show properties
          </button>
        </div>
      )}
    </div>
  );
}
