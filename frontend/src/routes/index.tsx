import { useDeferredValue, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { EmptyState, PropertyGridSkeleton } from "@/components/States";
import { SearchPill } from "@/components/SearchPill";
import { SmartImage } from "@/components/SmartImage";
import { filterProperties, pickFeatured } from "@/lib/api";
import { useStore } from "@/lib/mock-store";
import { useSavedProperties } from "@/lib/saved-properties";
import { cn } from "@/lib/utils";
import type { PropertyCategory } from "@/types/property";
import heroHouse from "@/assets/braj-courtyard-1536.jpg";
import heroHouseSmall from "@/assets/braj-courtyard-768.jpg";
import sellHome from "@/assets/sell-home.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Braj Setu Properties | Buy, Rent & Sell in Braj" },
      {
        name: "description",
        content:
          "Find flats, houses, plots, shops and farm houses in Vrindavan, Mathura, Govardhan and Barsana. Browse listings or list your property.",
      },
      { property: "og:title", content: "Find your place in Braj | Braj Setu Properties" },
      {
        property: "og:description",
        content:
          "Local property listings and support for buyers, tenants and owners across Braj Mandal.",
      },
    ],
  }),
  component: HomePage,
});

const categories: { value: "All" | PropertyCategory; label: string }[] = [
  { value: "All", label: "All properties" },
  { value: "Flat", label: "Flats" },
  { value: "House", label: "Houses" },
  { value: "Plot", label: "Plots" },
  { value: "Shop", label: "Shops" },
  { value: "Farm House", label: "Farm houses" },
];
const areas = ["Vrindavan", "Mathura", "Govardhan", "Barsana", "Gokul", "Nandgaon"];
const homeGrid = "grid grid-cols-1 gap-5 min-[600px]:grid-cols-2 lg:grid-cols-3 lg:gap-6";

function HomePage() {
  const [category, setCategory] = useState<"All" | PropertyCategory>("All");
  const displayedCategory = useDeferredValue(category);
  const { properties, news, hydrated, publicDataError, refreshPublic } = useStore();
  const { savedIds, toggleSaved } = useSavedProperties();
  const featured = useMemo(
    () =>
      pickFeatured(
        filterProperties(properties, {
          categories: displayedCategory === "All" ? undefined : [displayedCategory],
        }),
        6,
      ),
    [properties, displayedCategory],
  );

  return (
    <>
      <section className="pv-page-intro border-b border-border">
        <div className="pv-container grid items-center gap-8 pt-9 pb-6 sm:gap-10 sm:py-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:py-14">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-gold-deep">
              <MapPin className="size-4" aria-hidden="true" /> Braj Mandal, Uttar Pradesh
            </p>
            <h1 className="pv-title mt-4 text-[clamp(2.75rem,1.9rem+3.2vw,4.75rem)]">
              Find your place <em className="block text-gold-deep">in Braj.</em>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Explore homes, plots and commercial spaces across Vrindavan, Mathura and nearby towns.
            </p>
            <div className="pv-panel mt-6 max-w-xl p-3.5 sm:mt-8 sm:p-5">
              <SearchPill />
            </div>
          </div>
          <div className="relative aspect-[4/3] min-w-0 overflow-hidden rounded-[1.5rem] bg-ice shadow-[var(--shadow-lift)] sm:aspect-[16/10] lg:aspect-[6/5] lg:rounded-[2rem]">
            <img
              src={heroHouse}
              srcSet={`${heroHouseSmall} 768w, ${heroHouse} 1536w`}
              sizes="(min-width: 1248px) 612px, (min-width: 1024px) 51vw, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
              alt="Illustration of a Braj-inspired sandstone courtyard with carved arches"
              fetchPriority="high"
              decoding="async"
              width={1536}
              height={1024}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="pv-container pv-section" aria-labelledby="home-listings">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="home-listings" className="pv-heading">
            Explore properties
          </h2>
          <Link to="/buy" search={{ q: undefined }} className="pv-button-secondary gap-2">
            Browse all listings <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div
          role="group"
          aria-label="Filter by property type"
          className="mt-5 flex flex-wrap gap-2 sm:mt-7"
        >
          {categories.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={category === value}
              onClick={() => setCategory(value)}
              className={cn(
                "pv-smooth-state min-h-11 rounded-full border px-4 text-sm font-medium",
                category === value
                  ? "border-navy bg-navy text-white"
                  : "border-border bg-card text-navy hover:border-navy/35 hover:bg-smoke",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-6" aria-busy={!hydrated || displayedCategory !== category}>
          {!hydrated ? (
            <PropertyGridSkeleton count={3} className={homeGrid} />
          ) : featured.length ? (
            <div className={homeGrid}>
              {featured.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  saved={savedIds.includes(property.id)}
                  onToggleSaved={toggleSaved}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                publicDataError ? "Listings are temporarily unavailable" : "No listings here yet"
              }
              description={
                publicDataError
                  ? "Try loading the latest properties again."
                  : "Choose another property type or tell us what you’re looking for."
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
                ) : (
                  <Link to="/contact" className="pv-button-primary">
                    Contact our team
                  </Link>
                )
              }
            />
          )}
        </div>
      </section>

      <section className="border-y border-border bg-smoke" aria-labelledby="home-locations">
        <div className="pv-container pv-section">
          <h2 id="home-locations" className="pv-heading">
            Browse by location
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {areas.map((area) => (
              <Link
                key={area}
                to="/buy"
                search={{ q: area }}
                className="pv-smooth-state group flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-card p-3.5 hover:border-navy/35 hover:shadow-[var(--shadow-soft)] sm:p-4"
              >
                <MapPin className="size-4 text-gold-deep" aria-hidden="true" />
                <span className="flex items-center justify-between gap-1.5 text-sm font-semibold text-navy">
                  {area}{" "}
                  <ArrowUpRight
                    className="size-3.5 shrink-0 text-muted-foreground transition-transform motion-safe:group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pv-container pv-section" aria-labelledby="home-owners">
        <div className="grid overflow-hidden rounded-[1.5rem] bg-navy sm:rounded-[2rem] lg:grid-cols-[1fr_1.03fr]">
          <div className="self-center p-6 sm:p-10 lg:p-12">
            <h2 id="home-owners" className="pv-heading text-white">
              Ready to list your property?
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75 sm:text-base">
              Share your details and photos. Our team reviews each submission before it goes live.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-5">
              <Link
                to="/list-property"
                className="pv-button-secondary gap-2 border-gold bg-gold hover:bg-white"
              >
                List your property <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                to="/sale"
                search={{ q: undefined }}
                className="pv-tap inline-flex items-center text-sm font-medium text-white underline decoration-white/50 underline-offset-4"
              >
                How it works
              </Link>
            </div>
          </div>
          <SmartImage
            src={sellHome}
            alt="A bright kitchen and dining area"
            aspect="aspect-[16/10]"
            wrapperClassName="lg:aspect-auto lg:min-h-80"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </section>

      {news.length > 0 && (
        <section className="border-y border-border bg-smoke" aria-labelledby="home-news">
          <div className="pv-container pv-section">
            <h2 id="home-news" className="pv-heading">
              Property notes
            </h2>
            <div className={cn(homeGrid, "mt-6")}>
              {news.slice(0, 3).map((article) => (
                <article key={article.id} className="pv-panel overflow-hidden">
                  <SmartImage
                    src={article.image}
                    alt=""
                    aspect="aspect-[16/10]"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground">{article.date}</p>
                    <h3 className="mt-2 text-lg font-semibold text-navy">{article.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {article.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="border-t border-border">
        <div className="pv-container flex flex-wrap items-center justify-between gap-4 py-8">
          <h2 className="text-lg font-semibold text-navy">Have a question about a property?</h2>
          <Link to="/contact" className="pv-button-secondary gap-2">
            Talk to our team <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
