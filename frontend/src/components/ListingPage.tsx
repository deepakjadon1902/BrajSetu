import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
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
import { filterProperties } from "@/lib/api";
import { useStore } from "@/lib/mock-store";
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

  const activeFilters =
    [filters.city, filters.minPrice, filters.maxPrice, filters.bedrooms, filters.bathrooms].filter(
      Boolean,
    ).length +
    (filters.categories?.length ?? 0) +
    (filters.amenities?.length ?? 0);

  return (
    <div className="bg-smoke pb-12 sm:pb-16">
      <div className="border-b border-border bg-card">
        <div className="pv-container py-8 sm:py-10">
          <p className="pv-eyebrow">
            {intent === "Sale" ? "Properties for sale" : "Rental properties"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-navy sm:text-4xl">{heading}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {subheading}
          </p>
          <SearchPill
            variant="bar"
            defaultIntent={searchIntent}
            defaultQuery={initialQuery}
            onSearch={handleSearch}
            className="mt-6 max-w-3xl"
          />
        </div>
      </div>
      <div className="pv-container mt-6 grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside aria-label="Property filters" className="hidden lg:sticky lg:top-24 lg:block">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
            className="max-h-[calc(100dvh-7rem)] border border-border"
          />
        </aside>
        <section className="min-w-0" aria-label="Property results">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-soft)] sm:px-4">
            <p aria-live="polite" className="text-sm font-medium text-navy">
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
                <SheetContent side="bottom" className="max-h-[90dvh] rounded-t-2xl bg-card p-0">
                  <div className="border-b border-border px-5 py-4 pr-14">
                    <SheetTitle>Filter properties</SheetTitle>
                    <SheetDescription className="mt-1">
                      Choose your budget, location and property type.
                    </SheetDescription>
                  </div>
                  <FilterPanel
                    filters={filters}
                    onChange={setFilters}
                    onReset={resetFilters}
                    onApply={() => setPanelOpen(false)}
                    className="h-[min(70dvh,40rem)] rounded-none"
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
          {activeFilters > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="pv-tap mt-2 text-xs font-medium text-muted-foreground underline underline-offset-4"
            >
              Clear all filters
            </button>
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
