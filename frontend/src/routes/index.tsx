import { useDeferredValue, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, MapPin } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { EmptyState, PropertyGridSkeleton } from "@/components/States";
import { SearchPill } from "@/components/SearchPill";
import { SmartImage } from "@/components/SmartImage";
import { filterProperties, pickFeatured } from "@/lib/api";
import { useStore } from "@/lib/mock-store";
import { cn } from "@/lib/utils";
import type { PropertyCategory } from "@/types/property";
import heroHouse from "@/assets/hero-house.jpg";
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
    links: [{ rel: "preload", as: "image", href: heroHouse, fetchPriority: "high" }],
  }),
  component: HomePage,
});

const categories: ("All" | PropertyCategory)[] = [
  "All",
  "Flat",
  "House",
  "Plot",
  "Shop",
  "Farm House",
];
const areas = [
  { name: "Vrindavan", description: "Homes around the temple town" },
  { name: "Mathura", description: "City homes and commercial spaces" },
  { name: "Govardhan", description: "Plots, homes and farm houses" },
  { name: "Barsana", description: "Explore properties in the area" },
];

function HomePage() {
  const [category, setCategory] = useState<"All" | PropertyCategory>("All");
  const displayedCategory = useDeferredValue(category);
  const { properties, news, hydrated, publicDataError, refreshPublic } = useStore();
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
    <div>
      <section className="border-b border-border bg-[radial-gradient(ellipse_at_top_left,#f5ead7,transparent_58%),linear-gradient(135deg,#fafbfc,#edf2f8)]">
        <div className="pv-container grid gap-8 py-8 sm:py-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:py-16">
          <div className="min-w-0">
            <h1 className="max-w-xl text-[2.65rem] font-semibold leading-[1.06] tracking-[-0.045em] text-navy sm:text-5xl lg:text-[3.6rem]">
              Find your place
              <br className="hidden sm:block" /> in Braj.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
              A home, a fresh start, a space for your business. Explore properties across Vrindavan,
              Mathura and nearby towns.
            </p>
            <div className="mt-7 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] sm:p-6">
              <SearchPill />
            </div>
            <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-4 w-4" aria-hidden="true" /> Vrindavan · Mathura · Govardhan ·
              Barsana
            </p>
          </div>
          <div className="relative min-w-0">
            <SmartImage
              src={heroHouse}
              alt="A contemporary home with a landscaped garden"
              aspect="aspect-[5/4] sm:aspect-[16/10] lg:aspect-[6/5]"
              wrapperClassName="rounded-3xl border border-card shadow-[var(--shadow-lift)]"
              priority
              width={1600}
              height={1008}
            />
          </div>
        </div>
      </section>

      <section className="pv-container pv-section">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="pv-eyebrow">Explore the area</p>
            <h2 className="mt-2 text-2xl font-semibold text-navy sm:text-3xl">
              Where would you like to be?
            </h2>
          </div>
          <Link
            to="/buy"
            search={{ q: undefined }}
            className="pv-tap inline-flex items-center gap-2 text-sm font-semibold text-navy"
          >
            All locations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-7 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {areas.map((area) => (
            <Link
              key={area.name}
              to="/buy"
              search={{ q: area.name }}
              className="group flex min-w-0 items-start gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-navy/30 hover:bg-smoke"
            >
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-navy">{area.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {area.description}
                </p>
              </div>
              <ArrowRight
                className="mt-1 h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-smoke">
        <div className="pv-container pv-section">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="pv-eyebrow">A place for every plan</p>
              <h2 className="mt-2 text-2xl font-semibold text-navy sm:text-3xl">
                Explore properties
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Browse the current listings and find what fits your needs.
              </p>
            </div>
            <Link to="/buy" search={{ q: undefined }} className="pv-button-secondary gap-2">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div
            role="group"
            aria-label="Filter by property type"
            className="mt-6 flex flex-wrap gap-2"
          >
            {categories.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={category === value}
                onClick={() => setCategory(value)}
                className={cn(
                  "min-h-11 rounded-lg border px-4 text-sm font-medium transition-colors",
                  category === value
                    ? "border-navy bg-navy text-white"
                    : "border-border bg-card text-navy hover:border-navy/40",
                )}
              >
                {value === "All"
                  ? "All properties"
                  : value === "Flat"
                    ? "Flats"
                    : value === "House"
                      ? "Houses"
                      : value === "Plot"
                        ? "Plots"
                        : value === "Shop"
                          ? "Shops"
                          : "Farm houses"}
              </button>
            ))}
          </div>
          <div
            className="mt-7"
            aria-live="polite"
            aria-busy={!hydrated || displayedCategory !== category}
          >
            {!hydrated ? (
              <PropertyGridSkeleton count={4} />
            ) : featured.length ? (
              <div className="pv-property-grid">
                {featured.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={
                  publicDataError ? "Listings are temporarily unavailable" : "No listings here yet"
                }
                description={
                  publicDataError
                    ? "We could not load the latest properties. Try again or contact our team for help."
                    : "Try another property type or let our team know what you are looking for."
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
        </div>
      </section>

      <section className="pv-container pv-section grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
        <SmartImage
          src={sellHome}
          alt="A bright kitchen and dining area"
          aspect="aspect-[4/3]"
          wrapperClassName="rounded-2xl"
        />
        <div>
          <p className="pv-eyebrow">For property owners</p>
          <h2 className="mt-3 max-w-lg text-2xl font-semibold text-navy sm:text-3xl">
            Your property. Its next chapter.
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Selling or renting out a property? Share the details with our team. We will review your
            submission and help you take the next step.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Add your property details and photos",
              "Our team reviews the information",
              "Connect with interested buyers or tenants",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-navy">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/list-property" className="pv-button-primary gap-2">
              List your property <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/sale" search={{ q: undefined }} className="pv-button-secondary">
              How it works
            </Link>
          </div>
        </div>
      </section>

      {news.length > 0 && (
        <section className="border-t border-border bg-smoke">
          <div className="pv-container pv-section">
            <p className="pv-eyebrow">From our team</p>
            <h2 className="mt-2 text-2xl font-semibold text-navy sm:text-3xl">Property notes</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((article) => (
                <article
                  key={article.id}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <SmartImage src={article.image} alt="" aspect="aspect-[16/10]" />
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
        <div className="pv-container flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-navy">Need a little guidance?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell us what you have in mind. We are here to help.
            </p>
          </div>
          <Link to="/contact" className="pv-button-primary gap-2">
            Talk to our team <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
