import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { OverlayCard } from "@/components/OverlayCard";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchPill } from "@/components/SearchPill";
import { SmartImage } from "@/components/SmartImage";
import { filterProperties, pickFeatured } from "@/lib/api";
import { getMainImage } from "@/lib/property-images";
import { useStore } from "@/lib/mock-store";
import { cn } from "@/lib/utils";
import heroHouse from "@/assets/hero-house.jpg";
import sellHome from "@/assets/sell-home.jpg";
import tileNeighborhoods from "@/assets/tile-neighborhoods.jpg";
import tileNewHomes from "@/assets/tile-new-homes.jpg";
import tileAgents from "@/assets/tile-agents.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Braj Setu Properties | Buy, Rent & Sell Property with Confidence" },
      {
        name: "description",
        content:
          "Search verified flats, houses, plots, shops and farm houses across Vrindavan, Mathura, Govardhan, Barsana and nearby Braj Mandal locations.",
      },
      { property: "og:title", content: "Braj Setu Properties | Buy, Rent & Sell Property" },
      {
        property: "og:description",
        content: "Verified Braj Mandal listings with one advisor from first visit to handover.",
      },
    ],
    links: [
      {
        rel: "preload",
        as: "image",
        href: heroHouse,
        fetchPriority: "high",
      },
    ],
  }),
  component: HomePage,
});

const exploreFilters = [
  "New to Market",
  "3D Tours",
  "Most Viewed",
  "Open Houses",
  "Price Drop",
  "Luxury Homes",
  "Sold",
];

function HomePage() {
  const [activeFilter, setActiveFilter] = useState(exploreFilters[0]);
  const newsRef = useRef<HTMLDivElement>(null);
  const { properties, news } = useStore();

  const exploreCards = useMemo(() => filterProperties(properties).slice(0, 3), [properties]);
  const homesForYou = useMemo(() => pickFeatured(properties, 8), [properties]);

  function scrollNews(direction: -1 | 1) {
    newsRef.current?.scrollBy({ left: direction * 340, behavior: "smooth" });
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-background">
        <div className="pv-container pt-2 pb-0 sm:pt-3">
          <div className="hidden">
            <h1 className="text-3xl leading-[1.05] font-extrabold tracking-tight text-navy sm:text-5xl lg:text-6xl">
              Find the address
              <br />
              you'll keep for years.
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Flats, houses, plots, shops and farm houses — each one visited, photographed and
              title-checked by a Braj Setu Properties advisor before it reaches this page.
            </p>
          </div>

          <div className="pv-fade-up relative">
            <SmartImage
              src={heroHouse}
              alt="Contemporary house with landscaped frontage listed by Braj Setu Properties"
              aspect="aspect-[4/5] sm:aspect-[16/9] lg:aspect-[16/7]"
              wrapperClassName="rounded-[1.75rem] sm:rounded-[2rem]"
              className="object-center"
              priority
              width={1600}
              height={1008}
            />
            <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] bg-gradient-to-b from-navy/50 via-navy/5 to-navy/30 sm:rounded-[2rem]" />
            <div className="absolute inset-x-5 top-6 max-w-2xl sm:inset-x-8 sm:top-8 lg:inset-x-12 lg:top-10">
              <p className="text-xs font-bold tracking-wide text-background/80 uppercase">
                Braj Mandal Property Advisory
              </p>
              <h1 className="mt-3 max-w-2xl text-3xl leading-[1.05] font-extrabold text-background drop-shadow-sm sm:text-5xl lg:text-6xl">
                Buy, rent and sell around Shri Vrindavan.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-background/85 sm:text-base">
                Verified shops, flats, plots, houses and farm houses across Vrindavan, Mathura,
                Govardhan, Barsana and nearby villages.
              </p>
            </div>
            <div className="relative z-10 mx-auto -mt-20 w-[calc(100%-2rem)] max-w-5xl sm:-mt-16 lg:-mt-20">
              <SearchPill />
            </div>
          </div>
        </div>
      </section>

      {/* Explore */}
      {exploreCards.length > 0 ? (
        <section className="mt-10 bg-ice pt-14 pb-16 sm:mt-24 sm:pt-20">
          <div className="pv-container">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold tracking-tight text-navy sm:text-4xl">
                Explore our homes
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                Start with the places families ask us about most across Braj Mandal.
              </p>
            </div>

            <div className="pv-no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center">
              {exploreFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "pv-smooth-state shrink-0 rounded-full border px-5 py-2.5 text-xs font-semibold sm:text-sm",
                    activeFilter === filter
                      ? "border-navy bg-navy text-background"
                      : "border-border bg-background text-navy-soft hover:border-navy/40",
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="pv-no-scrollbar pv-snap-row mt-10 flex gap-6 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
              {exploreCards.map((property) => (
                <OverlayCard
                  key={property.id}
                  image={getMainImage(property)}
                  title={property.title}
                  subtitle={`${property.location.locality}, ${property.location.city}`}
                  to={property.intent === "Rent" ? "/rent" : "/buy"}
                  className="w-[82%] shrink-0 snap-start sm:w-auto"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Homes for you */}
      {homesForYou.length > 0 ? (
        <section className="py-16 sm:py-20">
          <div className="pv-container">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold tracking-tight text-navy sm:text-4xl">
                Homes for you
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                Latest verified properties from Braj Setu.
              </p>
            </div>

            <div className="pv-no-scrollbar pv-snap-row mt-10 flex gap-6 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-4">
              {homesForYou.map((property) => (
                <div key={property.id} className="w-[82%] shrink-0 snap-start sm:w-auto">
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                to="/buy"
                search={{ q: undefined }}
                className="pv-smooth-state pv-tap inline-flex items-center rounded-full border border-navy px-7 text-sm font-semibold text-navy hover:bg-navy hover:text-background"
              >
                Browse all listings
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Sell split section */}
      <section className="bg-ice py-16 sm:py-20">
        <div className="pv-container grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-navy sm:text-4xl">
              The smarter way to <span className="text-muted-foreground">sell your home.</span>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              We price from recent, verifiable transactions in your own micro-market, then bring
              qualified buyers to the door instead of broadcasting your address across every portal.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                "A valuation backed by six recent comparables",
                "Professional photography and a floor plan, included",
                "Only pre-qualified buyers at your viewings",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-sm font-medium text-navy">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/sale"
              search={{ q: undefined }}
              className="pv-smooth-state pv-tap mt-8 inline-flex items-center rounded-full bg-gold px-7 text-sm font-semibold text-primary-foreground hover:scale-[1.02]"
            >
              Learn more
            </Link>
          </div>
          <SmartImage
            src={sellHome}
            alt="Bright kitchen and dining area in a home listed with Braj Setu Properties"
            aspect="aspect-[4/3]"
            wrapperClassName="rounded-3xl shadow-[var(--shadow-lift)]"
          />
        </div>
      </section>

      {/* Discovery tiles */}
      <section className="py-16 sm:py-20">
        <div className="pv-container grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <OverlayCard
            image={tileNeighborhoods}
            title="Search neighbourhoods"
            subtitle="Compare localities on price trend, commute and schools."
            to="/buy"
            cta="Explore"
          />
          <OverlayCard
            image={tileNewHomes}
            title="New homes"
            subtitle="Fresh inventory from developers we've vetted ourselves."
            to="/buy"
            cta="Explore"
          />
          <OverlayCard
            image={tileAgents}
            title="Agent directory"
            subtitle="Meet the advisor who covers your micro-market."
            to="/about"
            cta="Explore"
          />
        </div>
      </section>

      {/* News */}
      {news.length > 0 ? (
        <section className="bg-ice py-16 sm:py-20">
          <div className="pv-container">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-2xl font-extrabold tracking-tight text-navy sm:text-4xl">
                  Real estate news
                </h2>
                <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                  Short, practical reads from our advisory desk.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  aria-label="Previous articles"
                  onClick={() => scrollNews(-1)}
                  className="pv-smooth-state grid h-11 w-11 place-items-center rounded-full border border-navy/20 bg-background text-navy hover:border-navy"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next articles"
                  onClick={() => scrollNews(1)}
                  className="pv-smooth-state grid h-11 w-11 place-items-center rounded-full border border-navy/20 bg-background text-navy hover:border-navy"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              ref={newsRef}
              className="pv-no-scrollbar pv-snap-row mt-8 flex gap-6 overflow-x-auto pb-2"
            >
              {news.map((article) => (
                <article
                  key={article.id}
                  className="pv-lift w-[82%] shrink-0 snap-start overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-soft)] sm:w-[46%] lg:w-[31%]"
                >
                  <SmartImage src={article.image} alt={article.title} aspect="aspect-[16/10]" />
                  <div className="p-5">
                    <p className="text-xs font-semibold tracking-wide text-gold-deep uppercase">
                      {article.date}
                    </p>
                    <h3 className="mt-2 text-base leading-snug font-bold text-navy">
                      {article.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {article.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
