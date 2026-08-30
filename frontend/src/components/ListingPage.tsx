import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid, List, Map as MapIcon, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { FilterPanel } from "@/components/FilterPanel";
import { MapPlaceholder } from "@/components/MapPlaceholder";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyPreview } from "@/components/PropertyPreview";
import { EmptyState, PropertyCardSkeleton, PropertyGridSkeleton } from "@/components/States";
import { SearchPill, type SearchIntent } from "@/components/SearchPill";
import { filterProperties } from "@/lib/api";
import { useStore } from "@/lib/mock-store";
import { cn } from "@/lib/utils";
import type { Property, PropertyFilters, PropertyIntent } from "@/types/property";

interface ListingPageProps {
  intent: PropertyIntent;
  searchIntent: SearchIntent;
  heading: string;
  subheading: string;
  initialQuery?: string;
}

type SortKey = "recommended" | "price-asc" | "price-desc" | "area-desc";

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
  const [view, setView] = useState<"list" | "grid">("list");
  const [mobilePanel, setMobilePanel] = useState<"filters" | "map" | null>(null);
  const [selected, setSelected] = useState<Property | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const didMount = useRef(false);
  const didRestore = useRef(false);

  const { properties, hydrated } = useStore();

  const results = useMemo(() => {
    const list = filterProperties(properties, filters);
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "area-desc") sorted.sort((a, b) => b.specs.area - a.specs.area);
    return sorted;
  }, [properties, filters, sort]);

  const pins = results.slice(0, 6).map((property, i) => ({
    id: property.id,
    label: property.location.locality,
    x: 18 + ((i * 13) % 64),
    y: 24 + ((i * 21) % 58),
  }));

  const scrollKey = `listing-scroll:${intent}`;
  const stateKey = "listing-state";

  useEffect(() => {
    if (didRestore.current) return;
    didRestore.current = true;
    const saved = window.sessionStorage.getItem(stateKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as {
        filters?: Omit<PropertyFilters, "intent">;
        sort?: SortKey;
        view?: "list" | "grid";
      };
      setFilters({
        ...(parsed.filters ?? {}),
        query: initialQuery || parsed.filters?.query,
        intent,
      });
      if (parsed.sort) setSort(parsed.sort);
      if (parsed.view) setView(parsed.view);
    } catch {
      window.sessionStorage.removeItem(stateKey);
    }
  }, [initialQuery, intent]);

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      intent,
      query: initialQuery || current.query,
    }));
  }, [initialQuery, intent]);

  useEffect(() => {
    const saved = window.sessionStorage.getItem(scrollKey);
    if (!saved) return;
    window.requestAnimationFrame(() => window.scrollTo({ top: Number(saved), behavior: "auto" }));
  }, [scrollKey]);

  useEffect(() => {
    return () => {
      window.sessionStorage.setItem(scrollKey, String(window.scrollY));
    };
  }, [scrollKey]);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    setIsFiltering(true);
    const id = window.setTimeout(() => setIsFiltering(false), 260);
    return () => window.clearTimeout(id);
  }, [filters, sort, view]);

  useEffect(() => {
    const { intent: _intent, ...filtersToPersist } = filters;
    window.sessionStorage.setItem(
      stateKey,
      JSON.stringify({ filters: filtersToPersist, sort, view }),
    );
  }, [filters, sort, view]);

  const handleSearch = useCallback((query: string) => {
    setFilters((f) => ({ ...f, query: query || undefined }));
  }, []);

  return (
    <div className="bg-smoke pb-20">
      <div className="pv-container pt-8 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{heading}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{subheading}</p>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchPill
            variant="bar"
            defaultIntent={searchIntent}
            defaultQuery={initialQuery}
            className="flex-1"
            onSearch={handleSearch}
            onToggleFilters={() => setMobilePanel("filters")}
          />
          <button
            type="button"
            onClick={() => toast.success("Search saved for this session.")}
            className="pv-smooth-state pv-tap shrink-0 rounded-full border border-navy px-6 text-sm font-semibold text-navy hover:bg-navy hover:text-background"
          >
            Save Search
          </button>
        </div>
      </div>

      <div className="pv-container grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_360px]">
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          className="hidden shadow-[var(--shadow-soft)] lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100vh-8rem)]"
        />

        <section className="min-w-0">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
            <h2 className="truncate text-lg font-bold text-navy">
              {results.length} {intent === "Sale" ? "homes for sale" : "homes for rent"}
            </h2>
            <div className="flex shrink-0 items-center gap-2">
              <label className="sr-only" htmlFor="sort">
                Sort results
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="pv-smooth-state min-h-11 rounded-full border border-border bg-background px-4 text-xs font-medium text-navy outline-none focus:border-gold"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="area-desc">Largest area</option>
              </select>
              <div className="hidden rounded-full border border-border p-1 sm:flex">
                <button
                  type="button"
                  aria-label="List view"
                  onClick={() => setView("list")}
                  className={cn(
                    "pv-smooth-state grid h-9 w-9 place-items-center rounded-full",
                    view === "list" ? "bg-navy text-background" : "text-navy",
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Grid view"
                  onClick={() => setView("grid")}
                  className={cn(
                    "pv-smooth-state grid h-9 w-9 place-items-center rounded-full",
                    view === "grid" ? "bg-navy text-background" : "text-navy",
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {!hydrated ? (
            <div className="mt-6">
              <PropertyGridSkeleton count={view === "grid" ? 4 : 3} compact={view === "list"} />
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              className="mt-6"
              action={
                <button
                  type="button"
                  onClick={() => setFilters({ intent })}
                  className="pv-tap rounded-full bg-navy px-6 text-sm font-semibold text-background"
                >
                  Reset filters
                </button>
              }
            />
          ) : (
            <div
              className={cn(
                "relative mt-6",
                view === "grid"
                  ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-2"
                  : "flex flex-col gap-4",
              )}
            >
              {isFiltering && (
                <div className="absolute inset-0 z-10 rounded-2xl bg-smoke/75 backdrop-blur-[1px]">
                  <div
                    className={cn(
                      "grid gap-6",
                      view === "grid" ? "sm:grid-cols-2 xl:grid-cols-2" : "grid-cols-1",
                    )}
                    aria-hidden="true"
                  >
                    {Array.from({ length: Math.min(results.length || 4, 4) }).map((_, i) => (
                      <PropertyCardSkeleton key={i} compact={view === "list"} />
                    ))}
                  </div>
                </div>
              )}
              {results.map((property) =>
                view === "grid" ? (
                  <PropertyCard key={property.id} property={property} />
                ) : (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    variant="compact"
                    active={selected?.id === property.id}
                    onSelect={setSelected}
                  />
                ),
              )}
            </div>
          )}

          {selected && (
            <PropertyPreview
              property={selected}
              onClose={() => setSelected(null)}
              className="mt-8 xl:hidden"
            />
          )}
        </section>

        <div className="hidden xl:block">
          <div className="sticky top-24 space-y-6">
            <MapPlaceholder pins={pins} className="h-[420px] min-h-0" />
            {selected && <PropertyPreview property={selected} onClose={() => setSelected(null)} />}
          </div>
        </div>
      </div>

      {/* Mobile / tablet floating controls */}
      <div className="fixed inset-x-0 bottom-5 z-40 flex justify-center gap-3 px-5 xl:hidden">
        <button
          type="button"
          onClick={() => setMobilePanel("filters")}
          className="pv-smooth-state pv-tap flex items-center gap-2 rounded-full bg-navy px-6 text-sm font-semibold text-background shadow-[var(--shadow-float)] hover:scale-[1.02] lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
        <button
          type="button"
          onClick={() => setMobilePanel("map")}
          className="pv-smooth-state pv-tap flex items-center gap-2 rounded-full bg-gold px-6 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-float)] hover:scale-[1.02]"
        >
          <MapIcon className="h-4 w-4" />
          Map
        </button>
      </div>

      {mobilePanel && (
        <div className="pv-page-transition fixed inset-0 z-50 flex flex-col justify-end bg-navy/40 backdrop-blur-sm xl:hidden">
          <button
            type="button"
            aria-label="Close panel"
            onClick={() => setMobilePanel(null)}
            className="flex-1"
          />
          <div className="max-h-[88vh] overflow-hidden rounded-t-3xl bg-background">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-bold text-navy">
                {mobilePanel === "filters" ? "Filters" : "Map view"}
              </h2>
              <button
                type="button"
                onClick={() => setMobilePanel(null)}
                aria-label="Close"
                className="grid h-11 w-11 place-items-center rounded-full border border-border text-navy"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {mobilePanel === "filters" ? (
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                onApply={() => setMobilePanel(null)}
                className="max-h-[74vh]"
              />
            ) : (
              <div className="p-5">
                <MapPlaceholder pins={pins} className="h-[60vh] min-h-0" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
