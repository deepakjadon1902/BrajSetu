import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { FilterPanel } from "@/components/FilterPanel";
import { PropertyCard } from "@/components/PropertyCard";
import { EmptyState, PropertyGridSkeleton } from "@/components/States";
import { SearchPill, type SearchIntent } from "@/components/SearchPill";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { filterProperties, formatPrice } from "@/lib/api";
import { useStore } from "@/lib/mock-store";
import { useSavedProperties } from "@/lib/saved-properties";
import { cn } from "@/lib/utils";
import type { PropertyFilters, PropertyIntent } from "@/types/property";

interface ListingPageProps {
  intent: PropertyIntent;
  searchIntent: SearchIntent;
  heading: string;
  subheading: string;
  initialQuery?: string;
}
type SortKey = "recommended" | "price-asc" | "price-desc";
const routes = { Buy: "/buy", Rent: "/rent", Sell: "/sale" } as const;

export function ListingPage({
  intent,
  searchIntent,
  heading,
  subheading,
  initialQuery = "",
}: ListingPageProps) {
  const [filters, setFilters] = useState<PropertyFilters>({
    intent,
    query: initialQuery || undefined,
  });
  const [sort, setSort] = useState<SortKey>("recommended");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [panelOpen, setPanelOpen] = useState(false);
  const restored = useRef(false);
  const { properties, hydrated, publicDataError, refreshPublic } = useStore();
  const { savedIds, toggleSaved } = useSavedProperties();
  const navigate = useNavigate();
  const storageKey = "listing-state:" + searchIntent;

  useEffect(() => {
    if (restored.current) return;
    try {
      const saved = window.sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          filters?: PropertyFilters;
          sort?: SortKey;
          view?: "grid" | "list";
        };
        if (parsed.filters)
          setFilters({ ...parsed.filters, intent, query: initialQuery || undefined });
        if (parsed.sort && ["recommended", "price-asc", "price-desc"].includes(parsed.sort))
          setSort(parsed.sort);
        if (parsed.view === "grid" || parsed.view === "list") setView(parsed.view);
      }
    } catch {
      /* Browsing remains available if session storage is unavailable. */
    }
    restored.current = true;
  }, [storageKey, intent, initialQuery]);

  useEffect(() => {
    setFilters((current) => ({ ...current, intent, query: initialQuery || undefined }));
  }, [initialQuery, intent]);

  useEffect(() => {
    if (!restored.current) return;
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify({ filters, sort, view }));
    } catch {
      /* Optional persistence. */
    }
  }, [filters, sort, view, storageKey]);

  const displayedFilters = useDeferredValue(filters);
  const results = useMemo(() => {
    const list = filterProperties(properties, displayedFilters);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [properties, displayedFilters, sort]);

  const handleSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      setFilters((current) => ({ ...current, query: trimmed || undefined }));
      void navigate({
        to: routes[searchIntent],
        search: { q: trimmed || undefined },
        replace: true,
      });
    },
    [navigate, searchIntent],
  );

  function resetFilters() {
    setFilters({ intent });
    handleSearch("");
  }

  const criteria = [
    filters.city?.trim() && {
      key: "city",
      label: filters.city.trim(),
      remove: () => setFilters((current) => ({ ...current, city: undefined })),
    },
    (filters.minPrice !== undefined || filters.maxPrice !== undefined) && {
      key: "budget",
      label: [
        filters.minPrice !== undefined && `From ${formatPrice(filters.minPrice)}`,
        filters.maxPrice !== undefined && `Up to ${formatPrice(filters.maxPrice)}`,
      ]
        .filter(Boolean)
        .join(" · "),
      remove: () =>
        setFilters((current) => ({ ...current, minPrice: undefined, maxPrice: undefined })),
    },
    !!filters.bedrooms && {
      key: "beds",
      label: `${filters.bedrooms}+ beds`,
      remove: () => setFilters((current) => ({ ...current, bedrooms: undefined })),
    },
    !!filters.bathrooms && {
      key: "baths",
      label: `${filters.bathrooms}+ baths`,
      remove: () => setFilters((current) => ({ ...current, bathrooms: undefined })),
    },
    ...(filters.categories ?? []).map((category) => ({
      key: `type-${category}`,
      label: category,
      remove: () =>
        setFilters((current) => ({
          ...current,
          categories: current.categories?.filter((item) => item !== category),
        })),
    })),
    ...(filters.amenities ?? []).map((amenity) => ({
      key: `amenity-${amenity}`,
      label: amenity,
      remove: () =>
        setFilters((current) => ({
          ...current,
          amenities: current.amenities?.filter((item) => item !== amenity),
        })),
    })),
  ].filter((item) => typeof item === "object");
  const activeFilters = criteria.length;
  const chips = filters.query
    ? [
        { key: "query", label: `Search: ${filters.query}`, remove: () => handleSearch("") },
        ...criteria,
      ]
    : criteria;

  return (
    <div className="bg-smoke pb-12 sm:pb-16">
      <div className="pv-page-intro border-b border-border">
        <div className="pv-container py-8 sm:py-11 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.78fr)] lg:items-end lg:gap-12 lg:py-14">
          <div className="min-w-0">
            <p className="pv-eyebrow">
              {intent === "Sale" ? "Properties for sale" : "Rental properties"}
            </p>
            <h1 className="pv-title mt-3">{heading}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {subheading}
            </p>
          </div>
          <SearchPill
            variant="bar"
            defaultIntent={searchIntent}
            defaultQuery={initialQuery}
            onSearch={handleSearch}
            className="mt-5 max-w-2xl lg:mt-0"
          />
        </div>
      </div>
      <div className="pv-container mt-6 grid items-start gap-5 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-7">
        <aside aria-label="Property filters" className="hidden lg:sticky lg:top-24 lg:block">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
            className="pv-panel max-h-[calc(100dvh-7rem)]"
          />
        </aside>
        <section className="min-w-0" aria-label="Property results">
          <div className="pv-panel flex flex-wrap items-center justify-between gap-2 p-3 sm:gap-3 sm:px-4">
            <p aria-live="polite" className="text-sm font-semibold tabular-nums text-navy">
              {hydrated
                ? results.length + (results.length === 1 ? " property" : " properties")
                : "Loading properties…"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
                <SheetTrigger asChild>
                  <button type="button" className="pv-button-secondary gap-2 px-3 lg:hidden">
                    <SlidersHorizontal className="h-4 w-4" /> Filters
                    {activeFilters ? " (" + activeFilters + ")" : ""}
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[90dvh] rounded-t-3xl bg-card p-0">
                  <SheetTitle className="sr-only">Filter properties</SheetTitle>
                  <SheetDescription className="sr-only">
                    Choose a location, budget and property type.
                  </SheetDescription>
                  <FilterPanel
                    filters={filters}
                    onChange={setFilters}
                    onReset={resetFilters}
                    onApply={() => setPanelOpen(false)}
                    className="h-[min(80dvh,40rem)] rounded-none"
                  />
                </SheetContent>
              </Sheet>
              <label htmlFor="property-sort" className="sr-only">
                Sort properties
              </label>
              <select
                id="property-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className="min-h-11 max-w-[190px] rounded-lg border border-border bg-card px-3 text-sm text-navy"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
              <div
                role="group"
                aria-label="Result layout"
                className="hidden items-center rounded-lg border border-border bg-card p-0.5 sm:flex"
              >
                <button
                  type="button"
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                  onClick={() => setView("grid")}
                  className={cn("pv-icon-button", view === "grid" && "bg-smoke")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                  className={cn("pv-icon-button", view === "list" && "bg-smoke")}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          {chips.length > 0 && (
            <div
              className="mt-3 flex flex-wrap items-center gap-2"
              aria-label="Active filters"
              role="group"
            >
              {chips.map(({ key, label, remove }) => (
                <button
                  key={key}
                  type="button"
                  aria-label={`Remove ${label}`}
                  onClick={remove}
                  className="pv-smooth-state pv-tap inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-card px-3 text-xs font-semibold text-navy hover:border-navy/40"
                >
                  <span className="truncate">{label}</span>
                  <X className="size-3.5 shrink-0" aria-hidden="true" />
                </button>
              ))}
              {chips.length > 1 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="pv-tap px-2 text-xs font-medium text-muted-foreground underline underline-offset-4"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
          <div className="mt-5" aria-busy={!hydrated || displayedFilters !== filters}>
            {!hydrated ? (
              <PropertyGridSkeleton count={4} compact={view === "list"} />
            ) : results.length > 0 ? (
              <div className={view === "grid" ? "pv-property-grid" : "grid gap-4"}>
                {results.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    variant={view === "list" ? "compact" : "standard"}
                    saved={savedIds.includes(property.id)}
                    onToggleSaved={toggleSaved}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={
                  publicDataError
                    ? "Listings are temporarily unavailable"
                    : properties.length
                      ? "No properties match your search"
                      : "No listings available yet"
                }
                description={
                  publicDataError
                    ? "We could not load the latest listings. Try again or contact our team."
                    : properties.length
                      ? "Try another location, a wider budget or fewer filters."
                      : "Contact our team and tell us what you are looking for."
                }
                action={
                  publicDataError ? (
                    <button
                      type="button"
                      onClick={() => void refreshPublic()}
                      className="pv-button-primary"
                    >
                      Try again
                    </button>
                  ) : properties.length ? (
                    <button type="button" onClick={resetFilters} className="pv-button-primary">
                      Clear search and filters
                    </button>
                  ) : (
                    <Link to="/contact" className="pv-button-primary">
                      Contact our team
                    </Link>
                  )
                }
              />
            )}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Prices and availability may change. Check property details and documents before making a
            decision.
          </p>
        </section>
      </div>
    </div>
  );
}
