import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { NotificationBar } from "@/components/NotificationBar";
import { OverlayCard } from "@/components/OverlayCard";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchPill } from "@/components/SearchPill";
import { SmartImage } from "@/components/SmartImage";
import { getFeaturedProperties, getNews, getProperties } from "@/lib/api";
import { cn } from "@/lib/utils";
import heroHouse from "@/assets/hero-house.jpg";
import sellHome from "@/assets/sell-home.jpg";
import tileNeighborhoods from "@/assets/tile-neighborhoods.jpg";
import tileNewHomes from "@/assets/tile-new-homes.jpg";
import tileAgents from "@/assets/tile-agents.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PropVista | Buy, Rent & Sell Property with Confidence" },
      {
        name: "description",
        content:
          "Search verified flats, houses, plots, shops and farm houses across India. Every PropVista listing is visited and title-checked before it goes live.",
      },
      { property: "og:title", content: "PropVista | Buy, Rent & Sell Property" },
      {
        property: "og:description",
        content:
          "Verified listings, map-led search and one advisor from first visit to handover.",
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
  const news = getNews();

  const exploreCards = useMemo(() => getProperties().slice(0, 3), []);
  const homesForYou = useMemo(() => getFeaturedProperties(8), []);

  function scrollNews(direction: -1 | 1) {
    newsRef.current?.scrollBy({ left: direction * 340, behavior: "smooth" });
  }

  return (
    <div>
      <NotificationBar>
        New this week: 24 verified listings added across Pune, Mumbai and Goa.
      </NotificationBar>

      {/* Hero */}
      <section className="bg-background">
        <div className="pv-container pt-10 pb-0 sm:pt-14">
          <div className="pv-fade-up grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end">
            <h1 className="text-3xl leading-[1.05] font-extrabold tracking-tight text-navy sm:text-5xl lg:text-6xl">
              Find the address
              <br />
              you'll keep for years.
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Flats, houses, plots, shops and farm houses — each one visited,
              photographed and title-checked by a PropVista advisor before it reaches
              this page.
            </p>
          </div>

          <div className="relative mt-8 sm:mt-12">
            <SmartImage
              src={heroHouse}
              alt="Contemporary house with landscaped frontage listed by PropVista"
              aspect="aspect-[16/10] sm:aspect-[16/8]"
              wrapperClassName="rounded-3xl"
              priority
              width={1600}
              height={1008}
            />
            <div className="mt-4 sm:absolute sm:inset-x-6 sm:-bottom-14 sm:mt-0 lg:inset-x-16">
              <SearchPill />
            </div>
          </div>
        </div>
      </section>

      {/* Explore */}
      <section className="mt-10 bg-ice pt-14 pb-16 sm:mt-24 sm:pt-20">
        <div className="pv-container">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-navy sm:text-4xl">
              Explore our homes
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Start from how you're searching, not from a dropdown of postcodes.
            </p>
          </div>

          <div className="pv-no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center">
            {exploreFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "shrink-0 rounded-full border px-5 py-2.5 text-xs font-semibold transition-colors sm:text-sm",
                  activeFilter === filter
                    ? "border-navy bg-navy text-background"
                    : "border-border bg-background text-navy-soft hover:border-navy/40",
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exploreCards.map((property) => (
              <OverlayCard
                key={property.id}
                image={property.images[0] ?? ""}
                title={property.title}
                subtitle={`${property.location.locality}, ${property.location.city}`}
                to={property.intent === "Rent" ? "/rent" : "/buy"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Homes for you */}
      <section className="py-16 sm:py-20">
        <div className="pv-container">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-navy sm:text-4xl">
              Homes for you
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              A curated cross-section of what our advisors are showing this month.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {homesForYou.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              to="/buy"
              className="pv-tap inline-flex items-center rounded-full border border-navy px-7 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-background"
            >
              Browse all listings
            </Link>
          </div>
        </div>
      </section>

      {/* Sell split section */}
      <section className="bg-ice py-16 sm:py-20">
        <div className="pv-container grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-navy sm:text-4xl">
              The smarter way to{" "}
              <span className="text-muted-foreground">sell your home.</span>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              We price from recent, verifiable transactions in your own micro-market,
              then bring qualified buyers to the door instead of broadcasting your
              address across every portal.
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
              className="pv-tap mt-8 inline-flex items-center rounded-full bg-gold px-7 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:scale-[1.02]"
            >
              Learn more
            </Link>
          </div>
          <SmartImage
            src={sellHome}
            alt="Bright kitchen and dining area in a home listed with PropVista"
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
                className="grid h-11 w-11 place-items-center rounded-full border border-navy/20 bg-background text-navy transition-colors hover:border-navy"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next articles"
                onClick={() => scrollNews(1)}
                className="grid h-11 w-11 place-items-center rounded-full border border-navy/20 bg-background text-navy transition-colors hover:border-navy"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={newsRef}
            className="pv-no-scrollbar mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2"
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
    </div>
  );
}
